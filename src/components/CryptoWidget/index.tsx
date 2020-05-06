import React, {useEffect, useState} from 'react';
import {ProductItem} from "../../services/ProductService/types";
import {AgGridReact} from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import './styles/common.scss';

import wsClient from "../../helpers/WebSocketClient";
import {WEBSOCKET_URL} from "../../config";
import RadioButton from "../../Containers/RadioButton";
import SearchInput from "../../Containers/SearchInput";
import {gridOptions} from "./gridOptions";
import {COLUMN_KEYS} from "./constants";
import SingleCategoryFilterButton from "../../Containers/SingleCategoryFilterButton";

type CategoriesList = {
    [key: string]: Set<string>;
}

type Props = {
    list: ProductItem[],
    categoriesList: CategoriesList
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

    gridOptions.api.applyTransactionAsync({update: dataToUpdate});

}

function onFilterTextBoxChanged() {
    const filterInputElement: Partial<HTMLInputElement> = document.getElementById('filter-text-box');
    gridOptions.api.setQuickFilter(filterInputElement && filterInputElement.value);
}

function volumeChangeSwitched(value?: string): void {
    if (!value) {
        gridOptions.columnApi.setColumnsVisible([COLUMN_KEYS.CHANGE, COLUMN_KEYS.VOLUME], true);
    } else {
        gridOptions.columnApi.setColumnVisible(value, true);
        gridOptions.columnApi.setColumnVisible(value === COLUMN_KEYS.CHANGE ? COLUMN_KEYS.VOLUME : COLUMN_KEYS.CHANGE, false);
    }
    gridOptions.api.sizeColumnsToFit();
}

function externalSingleFilterChanged(newValue: string) {
    let filterToApply;
    if (newValue === 'favorite') {
        filterToApply = {
            f: {
                type: 'equals',
                filter: 'true',
            },
        };
    } else {
        filterToApply = {
            [COLUMN_KEYS.FAVORITE]: {
                type: 'endsWith',
                filter: newValue.toUpperCase(),
            },
        };
    }
    gridOptions.api.setFilterModel(filterToApply);
    gridOptions.api.onFilterChanged();
}

function CryptoWidget({list, categoriesList}: Props) {
    const [activeFilterButton, setActiveFilterButton] = useState(Object.keys(categoriesList)[0]);
    const [activeRadioButton, setActiveRadioButton] = useState(COLUMN_KEYS.CHANGE);

    useEffect(() => {
        wsClient.openWs(WEBSOCKET_URL).then(res => {
            console.log('connection result from component', res);
            console.log('websocket client', wsClient);
        });
        wsClient.setMessageHandler(onWsUpdate);
    }, []);

    const singleFilterCallback = category => {
        setActiveFilterButton(category);
        externalSingleFilterChanged(category);
    };

    const singleRadioCallback = value => {
        setActiveRadioButton(value);
        volumeChangeSwitched(value);
    };

    return (
        <div id="grid-wrapper" className="ag-theme-alpine" style={{height: '350px'}}>
            <div className="filter-row">
                <div className="filter-column">
                    <div className="filter-column-wrapper">
                        <SingleCategoryFilterButton
                            category={'favorite'}
                            filterCallback={singleFilterCallback}
                            activeValue={activeFilterButton}
                            content={<i className={`iconfont icon-star`} />}
                        />
                    </div>
                    <div className="filter-column-wrapper">
                        {Object.keys(categoriesList).map(v => {
                            if (categoriesList[v].size > 1) {
                                return null;
                            }
                            return (
                                <SingleCategoryFilterButton
                                    key={v}
                                    category={v}
                                    filterCallback={singleFilterCallback}
                                    activeValue={activeFilterButton}
                                />
                            )
                        })}
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
                        checked={activeRadioButton === COLUMN_KEYS.CHANGE}
                        onChange={singleRadioCallback}
                    />
                    <RadioButton
                        id={COLUMN_KEYS.VOLUME}
                        name="filter"
                        label="Volume"
                        checked={activeRadioButton === COLUMN_KEYS.VOLUME}
                        onChange={singleRadioCallback}
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
