import React, {useEffect, useState} from 'react';
import wsClient from './helpers/WebSocketClient';
import CryptoWidget from "./components/CryptoWidget";
import {ProductResponse} from "./services/ProductService/types";
import ProductService from "./services/ProductService";

import './app.scss';

function App() {
    const [list, setList] = useState([]);
    const forceCloseWebsocket = function (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        wsClient.close();
        console.log('websocket force closed');
    };

    useEffect(() => {
        const apiClient = new ProductService();
        apiClient.getProducts().then((resp: ProductResponse): boolean => {
            const favorites: Array<string> = JSON.parse(localStorage.getItem('favorites')) || [];
            if (resp && resp.success) {
                setList(resp.data.map(v => ({...v, favorite: favorites.includes(v.s)})))
            }
            return true;
        }).catch(e => {
            console.log(e)
        })
    }, []);

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
            <CryptoWidget list={list}/>
        </>
    );
}

export default App;
