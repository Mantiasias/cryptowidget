import './index.scss';

function StarCellRenderer(): string | HTMLElement {
    return
}

StarCellRenderer.prototype.init = function (params: { data: { favorite: boolean; b: string; q: string; }; }) {
    this.eGui = document.createElement('span');
    this.eGui.innerHTML = `
       <i class="custom iconfont ${params.data.favorite ? 'icon-star yellow' : 'icon-star-filled yellow'}" />
       <span>${params.data.b}/${params.data.q}</span>
    `;
};

StarCellRenderer.prototype.getGui = function () {
    return this.eGui;
};

export default StarCellRenderer;
