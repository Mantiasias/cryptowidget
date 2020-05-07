import React, {useEffect, useState} from 'react';
import wsClient from './helpers/WebSocketClient';
import CryptoWidget from "./components/CryptoWidget";
import {ProductResponse} from "./services/ProductService/types";
import ProductService from "./services/ProductService";
import Loader from 'react-loader-spinner';

function App() {
    const [list, setList] = useState([]);
    const [categoriesList, setCategoriesList] = useState({});
    const forceCloseWebsocket = function (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        wsClient.close();
        console.log('websocket force closed');
    };

    useEffect(() => {
        const apiClient = new ProductService();
        apiClient.getProducts().then((resp: ProductResponse): void => {
            const favorites: Array<string> = JSON.parse(localStorage.getItem('favorites')) || [];
            if (resp && resp.success) {
                const categoriesList = resp.data.reduce((acc, v) => {
                    if (acc[v.pm]) {
                        acc[v.pm].add(v.q)
                    } else {
                        acc[v.pm] = new Set();
                    }

                    return acc;
                }, {});

                setCategoriesList(categoriesList);
                setList(resp.data.map(v => ({...v, favorite: favorites.includes(v.s)})))
            }
        }).catch(e => {
            console.log(e)
        })
    }, []);

    if (!list.length) {
        return (
            <Loader
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%'
                }}
                type="Puff"
                color="#00BFFF"
            />
        );
    }
    return (
        <>
            <div className="header">
                <span style={{marginRight: '8px'}}>
                    Market
                </span>
                <button style={{border: '1px solid black'}} onClick={forceCloseWebsocket}>
                    Force Close Wss
                </button>
            </div>
            <CryptoWidget list={list} categoriesList={categoriesList} />
        </>
    );
}

export default App;
