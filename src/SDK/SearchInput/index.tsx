import React from "react";

import './index.scss';

type Props = {
    searchCallback: () => void;
    width?: number;
}

function SearchInput(props: Props) {
    const {searchCallback, width = 12} = props;
    return (
        <>
            <svg width={width} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                 className="search-icon">
                <path
                    d="M3 10.982c0 3.845 3.137 6.982 6.982 6.982 1.518 0 3.036-.506 4.149-1.416L18.583 21 20 19.583l-4.452-4.452c.81-1.113 1.416-2.631 1.416-4.149 0-1.922-.81-3.643-2.023-4.958C13.726 4.81 11.905 4 9.982 4 6.137 4 3 7.137 3 10.982zM13.423 7.44a4.819 4.819 0 011.416 3.441c0 1.315-.506 2.53-1.416 3.44a4.819 4.819 0 01-3.44 1.417 4.819 4.819 0 01-3.441-1.417c-1.012-.81-1.518-2.023-1.518-3.339 0-1.315.506-2.53 1.416-3.44.911-1.012 2.227-1.518 3.542-1.518 1.316 0 2.53.506 3.44 1.416z"
                    fill="currentColor" />
            </svg>
            <input type="text" className="search-input" id="filter-text-box" placeholder="Filter..."
                   onChange={searchCallback} />
            <div className="search-input-divider" />
        </>
    )
}

export default SearchInput;
