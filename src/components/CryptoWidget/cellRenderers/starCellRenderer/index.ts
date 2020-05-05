function StarCellRenderer(): string | HTMLElement {
    return
}

StarCellRenderer.prototype.init = function (params) {
    this.eGui = document.createElement('span');
    this.eGui.style = "display: flex; height: 100%;";
    this.eGui.innerHTML = `
       <svg
            width="14"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            style="margin-right: 4px"
        >
            <path d="M21.4 10.8c-.3-1.1-.3-1.1-.7-2.1l-6-.1L12.8 3h-2.2l-2 5.6-5.9.1c-.3 1.1-.3 1.1-.7 2.1l4.8 3.6L5 20.1l1.8 1.3 4.9-3.4 4.9 3.4c.9-.7.9-.6 1.8-1.3l-1.8-5.7 4.8-3.6z"
                  fill="${params.data.favorite ? 'rgb(240, 185, 11)' : 'rgb(204, 204, 204)'}" />
        </svg>
        <span>${params.data.b}/${params.data.q}</span>
    `;
};

StarCellRenderer.prototype.getGui = function () {
    return this.eGui;
};


export default StarCellRenderer;
