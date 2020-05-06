import {GridOptions} from "ag-grid-community";
import StarCellRenderer from "../../Containers/StarCellRenderer";
import {COLUMN_KEYS, HEADER_HEIGHT, PRECISION, ROW_HEIGHT} from "./constants";
import {CustomLoadingOverlay} from "./overlays/loading";
import {CustomNoRowsOverlay} from "./overlays/noData";
import {
    changeCellComparator,
    getChangeValue,
    nearZero,
    onFirstDataRendered,
    onGridSizeChanged,
    starCellComparator,
    updateFavoritesLocalstorage
} from "./helpers";

export const gridOptions: GridOptions = {
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
    overlayLoadingTemplate: CustomLoadingOverlay,
    overlayNoRowsTemplate: CustomNoRowsOverlay,
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
