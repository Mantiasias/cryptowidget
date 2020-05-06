import React from 'react';

import './index.scss';

type Props = {
    id: string;
    name: string;
    label: string;
    onChange: (value) => void;
    checked: boolean
};

function RadioButton(props: Props) {
    const {id, name, label, onChange, checked} = props;
    return (
        <div className="md-radio md-radio-inline">
            <input id={id} type="radio" name={name} onChange={() => onChange(id)} checked={checked} />
                <label htmlFor={id}>
                    {label}
                </label>
        </div>
    )
}

export default RadioButton;


