import React from 'react';

import type { VerticalTabItem } from '../../InputPopover/vertical-tab-selector';
import VerticalTabSelector from '../../InputPopover/vertical-tab-selector';

interface BarrierTypeSelectorProps {
    selectedType: string;
    onSelectType: (type: string) => void;
    className?: string;
}

const BARRIER_TYPES: VerticalTabItem[] = [
    { value: 'above_spot', label: 'Above spot' },
    { value: 'below_spot', label: 'Below spot' },
    { value: 'fixed_barrier', label: 'Fixed barrier' },
];

const BarrierTypeSelector: React.FC<BarrierTypeSelectorProps> = ({ selectedType, onSelectType, className }) => {
    return (
        <VerticalTabSelector
            items={BARRIER_TYPES}
            selectedValue={selectedType}
            onSelect={onSelectType}
            className={className}
        />
    );
};

export default BarrierTypeSelector;
