import {ProductItem} from "../../services/ProductService/types";
import {PRECISION} from "./constants";

export function changeCellComparator(v1, v2, nodeA, nodeB): number {
    return getChangeValue(nodeA.data) - getChangeValue(nodeB.data);
}

export function nearZero(value): boolean {
    return Math.abs(value) < PRECISION;
}

export function onGridSizeChanged(params) {
    params.api.sizeColumnsToFit();
}

export function onFirstDataRendered(params) {
    params.api.sizeColumnsToFit();
}

export function starCellComparator(v1, v2, nodeA, nodeB): number {
    return nodeA.data.s.localeCompare(nodeB.data.s);
}

export function getChangeValue(nodeData: ProductItem): number {
    if (!nodeData.c) {
        return 0;
    }
    const diff: number = +nodeData.o - +nodeData.c;
    const res = diff / +nodeData.c;
    return +(res * 100).toFixed(2);
}

const LOCALSTORAGE_FAVORITE_KEY = 'favorites';

export const updateFavoritesLocalstorage = (productPairKey: string): void => {
    const favorites = JSON.parse(localStorage.getItem(LOCALSTORAGE_FAVORITE_KEY)) || [];
    const newState = favorites.includes(productPairKey)
        ? favorites.filter(val => val !== productPairKey)
        : [
            ...favorites,
            productPairKey
        ];

    localStorage.setItem(LOCALSTORAGE_FAVORITE_KEY, JSON.stringify(newState))
};
