import React, {useEffect, useState} from 'react';
import {ProductItem} from "../../services/ProductService/types";
import {AgGridReact} from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import './styles/common.scss';

import wsClient from "../../helpers/WebSocketClient";
import {WEBSOCKET_URL} from "../../config";
import RadioButton from "../../SDK/RadioButton";
import SearchInput from "../../SDK/SearchInput";
import {gridOptions} from "./gridOptions";
import {COLUMN_KEYS} from "./constants";

type Props = {
    list: ProductItem[]
}

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
