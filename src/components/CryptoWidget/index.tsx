import React, {useEffect} from 'react';
import {ProductItem} from "../../services/ProductService/types";
import {AgGridReact} from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import './styles/common.css';

import {GridOptions} from "ag-grid-community";

import logo from './logo.svg';
import StarCellRenderer from "./cellRenderers/starCellRenderer";
import wsClient from "../../helpers/WebSocketClient";
import {WEBSOCKET_URL} from "../../config";

const PRECISION = 0.001;
const ROW_HEIGHT = 44;
const HEADER_HEIGHT = 46;
type Props = {
    list: ProductItem[]
}

const LOCALSTORAGE_FAVORITE_KEY = 'favorites';
const COLUMN_FAVORITE_KEY = 'favorite';

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
    // get the current grids width
    var gridWidth = document.getElementById('grid-wrapper').offsetWidth;

    // keep track of which columns to hide/show
    var columnsToShow = [];
    var columnsToHide = [];

    // iterate over all columns (visible or not) and work out
    // now many columns can fit (based on their minWidth)
    var totalColsWidth = 0;
    var allColumns = params.columnApi.getAllColumns();
    for (var i = 0; i < allColumns.length; i++) {
        var column = allColumns[i];
        totalColsWidth += column.getMinWidth();
        if (totalColsWidth > gridWidth) {
            columnsToHide.push(column.colId);
        } else {
            columnsToShow.push(column.colId);
        }
    }

    // show/hide columns based on current grid width
    params.columnApi.setColumnsVisible(columnsToShow, true);
    params.columnApi.setColumnsVisible(columnsToHide, false);

    // fill out any available space to ensure there are no gaps
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
            field: COLUMN_FAVORITE_KEY,
            colId: COLUMN_FAVORITE_KEY,
            cellRenderer: 'starCellRenderer',
            comparator: starCellComparator
        },
        {
            headerName: "Last Price",
            field: "c",
            colId: "c",
            valueFormatter: function (params) {
                return (+params.data.c).toFixed(8)
            },
            cellStyle: function() {
                return {
                    color: '#1E2026'
                };
            }
        },
        {
            headerName: "Change",
            width: 100,
            suppressSizeToFit: true,
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
                    textAlign: 'right',
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
            width: 145,
            suppressSizeToFit: true,
            field: 'v',
            valueFormatter: function (params) {
                return (+params.value).toFixed(2)
            },
            cellStyle: function () {
                return {
                    textAlign: 'right'
                };
            }
        }
    ],
    defaultColDef: {
        sortable: true,
        resizable: false
    },
    overlayLoadingTemplate: customLoadingOverlay,
    overlayNoRowsTemplate: customNoRowsOverlay,
    components: {
        'starCellRenderer': StarCellRenderer
    },
    rowHeight: ROW_HEIGHT,
    headerHeight: HEADER_HEIGHT,
    onCellClicked: event => {
        const selectedColId = event.colDef.field;
        if (selectedColId === COLUMN_FAVORITE_KEY) {
            event.node.setDataValue(COLUMN_FAVORITE_KEY, !event.data.favorite);
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

function CryptoWidget({list}: Props) {
    useEffect(() => {
        wsClient.openWs(WEBSOCKET_URL).then(res => {
            console.log('connection result from component', res);
            console.log('websocket client', wsClient);
        });
        wsClient.setMessageHandler(onWsUpdate);
    }, []);

    return (
        <div id="grid-wrapper" className="ag-theme-alpine" style={{height: '1000px'}}>
            <AgGridReact
                gridOptions={gridOptions}
                rowData={list}
            />
        </div>
    );
}

export default CryptoWidget;
