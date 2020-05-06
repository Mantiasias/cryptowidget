import React, {useEffect} from 'react';
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

const PRECISION = 0.001;
const ROW_HEIGHT = 18;
const HEADER_HEIGHT = 20;
type Props = {
    list: ProductItem[]
}

const COLUMN_KEYS = {
    PAIR: 'PAIR',
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
        ? favorites.filter( val => val !== productPairKey )
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

function getChangeValue (nodeData: ProductItem): number {
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
            headerName: "Pair",
            field: 'favorite',
            colId: COLUMN_KEYS.FAVORITE,
            cellRenderer: 'starCellRenderer',
            comparator: starCellComparator,
            getQuickFilterText: function(params) {
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
            width: 145,
            colId: COLUMN_KEYS.CHANGE,
            comparator: changeCellComparator,
            valueGetter: function (params) {
                return getChangeValue(params.data);
            },
            valueFormatter: function (params) {
                const maybePlusSign = params.value > PRECISION ? '+': '';
                return `${maybePlusSign}${nearZero(params.value) ? Math.abs(params.value) : params.value}%`;
            },
            cellStyle: function(params) {
                const isNearZero = nearZero(params.value);
                const cellStyle = {
                    color: null
                };
                if (isNearZero) {
                    cellStyle.color = 'inherit';
                }
                else if (params.value < PRECISION) {
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
            width: 145,
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
    onCellClicked: event => {
        const selectedColId = event.colDef.colId;
        if (selectedColId === COLUMN_KEYS.FAVORITE) {
            event.node.setDataValue(COLUMN_KEYS.FAVORITE, !event.data.favorite);
            updateFavoritesLocalstorage(event.data.s);
        }
    },
    onFirstDataRendered: onFirstDataRendered,
    onGridSizeChanged: onGridSizeChanged,
    getRowNodeId: function(data) {
        return data.s;
    },
};

function onWsUpdate(data) {
    const preparedData = JSON.parse(data.data).data;
    const preparedDataById = preparedData.reduce((acc, v) => ({
        ...acc,
        [v.s]: v
    }), {});

    const dataToUpdate = [];
    gridOptions.api.forEachNodeAfterFilterAndSort((node: {data: ProductItem}) => {
        if (preparedDataById[node.data.s]) {
            dataToUpdate.push({
                ...node.data,
                ...preparedDataById[node.data.s],
                q: node.data.q,
            })
        }
    });

    gridOptions.api.applyTransaction({ update: dataToUpdate });

}


function onFilterTextBoxChanged() {
    const filterInputElement: Partial<HTMLInputElement> = document.getElementById('filter-text-box');
    gridOptions.api.setQuickFilter(filterInputElement && filterInputElement.value);
}

function externalFilterChanged(value?: string): void {
    gridOptions.columnApi.setColumnVisible(value, true);
    gridOptions.columnApi.setColumnVisible(value === COLUMN_KEYS.CHANGE ? COLUMN_KEYS.VOLUME : COLUMN_KEYS.CHANGE, false);
    gridOptions.api.sizeColumnsToFit();
}

function CryptoWidget({list}: Props) {
    useEffect(() => {
        wsClient.openWs(WEBSOCKET_URL).then(res => {
            console.log('connection result from component', res);
            console.log('websocket client', wsClient);
        });
        wsClient.setMessageHandler(onWsUpdate);
    }, []);

    return (
        <div id="grid-wrapper" className="ag-theme-alpine" style={{height: '350px'}}>
            <div className="filter-row">
                <div className="search">
                    <svg width={12} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="search-icon">
                        <path
                            d="M3 10.982c0 3.845 3.137 6.982 6.982 6.982 1.518 0 3.036-.506 4.149-1.416L18.583 21 20 19.583l-4.452-4.452c.81-1.113 1.416-2.631 1.416-4.149 0-1.922-.81-3.643-2.023-4.958C13.726 4.81 11.905 4 9.982 4 6.137 4 3 7.137 3 10.982zM13.423 7.44a4.819 4.819 0 011.416 3.441c0 1.315-.506 2.53-1.416 3.44a4.819 4.819 0 01-3.44 1.417 4.819 4.819 0 01-3.441-1.417c-1.012-.81-1.518-2.023-1.518-3.339 0-1.315.506-2.53 1.416-3.44.911-1.012 2.227-1.518 3.542-1.518 1.316 0 2.53.506 3.44 1.416z"
                            fill="currentColor" />
                    </svg>
                    <input type="text" className="search-input" id="filter-text-box" placeholder="Filter..." onChange={onFilterTextBoxChanged} />
                    <div className="search-input-divider" />
                </div>

                <div className="radioFilter">
                    <RadioButton
                        id={COLUMN_KEYS.CHANGE}
                        name="filter"
                        label="Change"
                        onChange={() => externalFilterChanged(COLUMN_KEYS.CHANGE)}
                    />
                    <RadioButton
                        id={COLUMN_KEYS.VOLUME}
                        name="filter"
                        label="Volume"
                        onChange={() => externalFilterChanged(COLUMN_KEYS.VOLUME)}
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
