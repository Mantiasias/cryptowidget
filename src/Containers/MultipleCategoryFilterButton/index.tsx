import React, {useState} from "react";
import SubCategoryListItem from "./SubCategoryListItem";

import './index.scss';

type Props = {
    category: string;
    activeCategory: string;
    filterCallback: (category: string, parentCategory?: string) => void;
    subcategoriesList: Set<string>;
}

function MultipleCategoryFilterButton(props: Props) {
    const {category, activeCategory, filterCallback, subcategoriesList} = props;
    const [opened, setOpened] = useState(false);
    const [baseLabel, setBaseLabel] = useState(category);

    const onSubCategorySelect = ((category, parentCategory?: string) => {
        filterCallback(category, parentCategory);
        setBaseLabel(category);
    });

    const isSubCategoryActive = baseLabel !== category;

    return (
        <div
            className="multiple-wrapper"
            onMouseLeave={() => setOpened(false)}
        >
            <button
                key={category}
                className={`subcategory-button ${activeCategory === category ? 'active' : ''}`}
                onClick={() =>
                    onSubCategorySelect(
                        isSubCategoryActive ? baseLabel : category,
                        isSubCategoryActive ? category : undefined
                    )
                }
            >
                {baseLabel}
            </button>
            <div
                className="toggler"
                onClick={() => setOpened(!opened)}
            >
                <span className={`toggler-arrow ${opened ? 'rotate' : ''}`}>▾</span>
                {!opened ? null : (
                    <ul className="subcat-list">
                        <li
                            key={category}
                            className="subcat-list__item"
                        >
                            <button
                                className={`li-button ${activeCategory === category ? 'active' : ''}`}
                                onClick={() => onSubCategorySelect(category)}
                                value={category}
                                type="button"
                            >
                                <i className="iconfont icon-hamburger" />
                                {category}
                            </button>
                        </li>
                        {
                            Array.from(subcategoriesList).map(v => (
                                <SubCategoryListItem
                                    key={v}
                                    subcategory={v}
                                    parentCategory={category}
                                    clickCallback={onSubCategorySelect}
                                />
                            ))
                        }
                    </ul>
                )}
            </div>
        </div>
    )
}

export default MultipleCategoryFilterButton;
