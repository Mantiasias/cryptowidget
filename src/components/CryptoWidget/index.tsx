import React, {useEffect, useState} from 'react';
import {ProductItem} from "../../services/ProductService/types";
import {AgGridReact} from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import './styles/common.scss';

import {GridOptions} from "ag-grid-community";

import logo from './logo.svg';
import StarCellRenderer from "./cellRenderers/starCellRenderer";
import wsClient from "../../helpers/WebSocketClient";
import {WEBSOCKET_URL} from "../../config";
import RadioButton from "../../SDK/RadioButton";
import SearchInput from "../../SDK/SearchInput";

const PRECISION = 0.001;
const ROW_HEIGHT = 18;
const HEADER_HEIGHT = 20;
type Props = {
    list: ProductItem[]
}

const COLUMN_KEYS = {
    FAVORITE: 'FAVORITE',
    CHANGE: 'CHANGE',
    VOLUME: 'VOLUME',
    LAST_PRICE: 'LAST_PRICE'
};

const LOCALSTORAGE_FAVORITE_KEY = 'favorites';

const customNoRowsOverlay = `
    <div>
        <img alt="No rows image" src="${logo}" style="margin: 16px 0;"/>
        <div>No records found</div>
    </div>
`;
const customLoadingOverlay = `Loading`;

const updateFavoritesLocalstorage = (productPairKey: string): void => {
    const favorites = JSON.parse(localStorage.getItem(LOCALSTORAGE_FAVORITE_KEY)) || [];
    const newState = favorites.includes(productPairKey)
        ? favorites.filter(val => val !== productPairKey)
        : [
            ...favorites,
            productPairKey
        ];

    localStorage.setItem(LOCALSTORAGE_FAVORITE_KEY, JSON.stringify(newState))
};

function onGridSizeChanged(params) {
    params.api.sizeColumnsToFit();
}

function onFirstDataRendered(params) {
    params.api.sizeColumnsToFit();
}

function starCellComparator(v1, v2, nodeA, nodeB): number {
    return nodeA.data.s.localeCompare(nodeB.data.s);
}

function getChangeValue(nodeData: ProductItem): number {
    if (!nodeData.c) {
        return 0;
    }
    const diff: number = +nodeData.o - +nodeData.c;
    const res = diff / +nodeData.c;
    return +(res * 100).toFixed(2);
}

function changeCellComparator(v1, v2, nodeA, nodeB): number {
    return getChangeValue(nodeA.data) - getChangeValue(nodeB.data);
}

function nearZero(value): boolean {
    return Math.abs(value) < PRECISION;
}

const gridOptions: GridOptions = {
    columnDefs: [
        {
            field: 'f',
            hide: true,
            valueGetter: function (params) {
                return params.data.favorite;
            }
        },
        {
            headerName: "Pair",
            field: 'favorite',
            colId: COLUMN_KEYS.FAVORITE,
            cellRenderer: 'starCellRenderer',
            comparator: starCellComparator,
            getQuickFilterText: function (params) {
                return `${params.data.b}/${params.data.q}`;
            },
            filterValueGetter: function (params) {
                return `${params.data.b}/${params.data.q}`;
            }
        },
        {
            headerName: "Last Price",
            headerClass: 'align-left',
            field: "c",
            colId: COLUMN_KEYS.LAST_PRICE,
            valueFormatter: function (params) {
                return (+params.data.c).toFixed(8)
            },
            cellClass: 'align-left column-last-price',
            cellRenderer: 'agAnimateShowChangeCellRenderer'
        },
        {
            headerName: "Change",
            headerClass: 'align-right',
            colId: COLUMN_KEYS.CHANGE,
            comparator: changeCellComparator,
            valueGetter: function (params) {
                return getChangeValue(params.data);
            },
            valueFormatter: function (params) {
                const maybePlusSign = params.value > PRECISION ? '+' : '';
                return `${maybePlusSign}${nearZero(params.value) ? Math.abs(params.value) : params.value}%`;
            },
            cellStyle: function (params) {
                const isNearZero = nearZero(params.value);
                const cellStyle = {
                    color: null
                };
                if (isNearZero) {
                    cellStyle.color = 'inherit';
                } else if (params.value < PRECISION) {
                    cellStyle.color = 'red';
                } else {
                    cellStyle.color = 'green';
                }
                return cellStyle;
            }
        },
        {
            headerName: "Volume",
            headerClass: 'align-right',
            hide: true,
            field: 'v',
            colId: COLUMN_KEYS.VOLUME,
            valueFormatter: function (params) {
                return (+params.value).toFixed(2)
            },
            cellRenderer: 'agAnimateShowChangeCellRenderer'
        }
    ],
    defaultColDef: {
        sortable: true,
        resizable: true
    },
    overlayLoadingTemplate: customLoadingOverlay,
    overlayNoRowsTemplate: customNoRowsOverlay,
    components: {
        'starCellRenderer': StarCellRenderer
    },
    rowHeight: ROW_HEIGHT,
    headerHeight: HEADER_HEIGHT,
    onFirstDataRendered: onFirstDataRendered,
    onGridSizeChanged: onGridSizeChanged,
    getRowNodeId: function (data) {
        return data.s;
    },
    onCellClicked: event => {
        const selectedColId = event.colDef.colId;
        if (selectedColId === COLUMN_KEYS.FAVORITE) {
            event.node.setDataValue(COLUMN_KEYS.FAVORITE, !event.data.favorite);
            updateFavoritesLocalstorage(event.data.s);
        }
    },
};

function onWsUpdate(data) {
    const preparedData = JSON.parse(data.data).data;
    const preparedDataById = preparedData.reduce((acc, v) => ({
        ...acc,
        [v.s]: v
    }), {});

    const dataToUpdate = [];
    gridOptions.api.forEachNodeAfterFilterAndSort((node: { data: ProductItem }) => {
        if (preparedDataById[node.data.s]) {
            dataToUpdate.push({
                ...node.data,
                ...preparedDataById[node.data.s],
                q: node.data.q,
            })
        }
    });

    gridOptions.api.applyTransaction({update: dataToUpdate});

}

function onFilterTextBoxChanged() {
    const filterInputElement: Partial<HTMLInputElement> = document.getElementById('filter-text-box');
    gridOptions.api.setQuickFilter(filterInputElement && filterInputElement.value);
}

function volumeChangeSwitched(value?: string): void {
    gridOptions.columnApi.setColumnVisible(value, true);
    gridOptions.columnApi.setColumnVisible(value === COLUMN_KEYS.CHANGE ? COLUMN_KEYS.VOLUME : COLUMN_KEYS.CHANGE, false);
    gridOptions.api.sizeColumnsToFit();
}

function externalFilterChanged(newValue) {
    switch (newValue) {
        case 'favorite': {
            const fFilter = {
                f: {
                    type: 'equals',
                    filter: 'true',
                },
            };
            gridOptions.api.setFilterModel(fFilter);
            gridOptions.api.onFilterChanged();
            break;
        }
        case 'bnb': {
            const bnbFilter = {
                [COLUMN_KEYS.FAVORITE]: {
                    type: 'endsWith',
                    filter: 'BNB',
                },
            };
            gridOptions.api.setFilterModel(bnbFilter);
            gridOptions.api.onFilterChanged();
            break;
        }
        case 'btc': {
            const btcFilter = {
                [COLUMN_KEYS.FAVORITE]: {
                    type: 'endsWith',
                    filter: 'BTC',
                },
            };
            gridOptions.api.setFilterModel(btcFilter);
            gridOptions.api.onFilterChanged();
            break;
        }
        default: {
            break;
        }
    }
}

function CryptoWidget({list}: Props) {
    const [activeFilterButton, setActiveFilterButton] = useState('');

    useEffect(() => {
        wsClient.openWs(WEBSOCKET_URL).then(res => {
            console.log('connection result from component', res);
            console.log('websocket client', wsClient);
        });
        wsClient.setMessageHandler(onWsUpdate);
    }, []);

    useEffect(() => {
        externalFilterChanged(activeFilterButton);
    }, [activeFilterButton]);

    return (
        <div id="grid-wrapper" className="ag-theme-alpine" style={{height: '350px'}}>
            <div className="filter-row">
                <div className="filter-column">
                    <div className="filter-column-wrapper">
                        <button className="category-button" onClick={() => setActiveFilterButton('favorite')}>
                            <i className={`iconfont icon-star ${activeFilterButton === 'favorite' ? 'active' : ''}`} />
                        </button>
                    </div>
                    <div className="filter-column-wrapper">
                        <button
                            className={`category-button ${activeFilterButton === 'bnb' ? 'active' : ''}`}
                            onClick={() => setActiveFilterButton('bnb')}
                        >
                            BNB
                        </button>
                        <button
                            className={`category-button ${activeFilterButton === 'btc' ? 'active' : ''}`}
                            onClick={() => setActiveFilterButton('btc')}
                        >
                            BTC
                        </button>
                    </div>
                </div>
            </div>
            <div className="filter-row">
                <div className="search">
                    <SearchInput searchCallback={onFilterTextBoxChanged} />
                </div>

                <div className="radioFilter">
                    <RadioButton
                        id={COLUMN_KEYS.CHANGE}
                        name="filter"
                        label="Change"
                        onChange={() => volumeChangeSwitched(COLUMN_KEYS.CHANGE)}
                    />
                    <RadioButton
                        id={COLUMN_KEYS.VOLUME}
                        name="filter"
                        label="Volume"
                        onChange={() => volumeChangeSwitched(COLUMN_KEYS.VOLUME)}
                    />
                </div>
            </div>

            <AgGridReact
                gridOptions={gridOptions}
                rowData={list}
            />
        </div>
    );
}

export default CryptoWidget;
