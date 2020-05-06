import React, {ReactChild} from "react";

type Props = {
    category: string;
    activeValue: string;
    filterCallback: (category: string) => void;
    content?: ReactChild
}
function SingleCategoryFilterButton (props: Props) {
    const {category, activeValue, filterCallback, content} = props;
    return (
        <button
            key={category}
            className={`category-button ${activeValue === category ? 'active' : ''}`}
            onClick={() => filterCallback(category)}
        >
            {content ? content : category}
        </button>
    )
}

export default SingleCategoryFilterButton;
