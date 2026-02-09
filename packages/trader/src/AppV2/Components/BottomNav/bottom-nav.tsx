import React from 'react';
import { useHistory, useLocation } from 'react-router';
import clsx from 'clsx';

import { routes } from '@deriv/shared';
import { Navigation } from '@deriv-com/quill-ui';

type BottomNavObject = {
    icon: React.JSX.Element;
    activeIcon: React.JSX.Element;
    label: React.JSX.Element;
    path: string;
};

type BottomNavProps = {
    bottomNavItems?: BottomNavObject[];
};

const BottomNav = ({ bottomNavItems }: BottomNavProps) => {
    const history = useHistory();
    const location = useLocation();

    const [selectedIndex, setSelectedIndex] = React.useState(() => {
        const idx = bottomNavItems?.findIndex(item => item.path === location.pathname) ?? -1;
        return idx >= 0 ? idx : 0;
    });

    React.useEffect(() => {
        const currentIndex = bottomNavItems?.findIndex(item => item.path === location.pathname);
        if (currentIndex !== undefined && currentIndex > -1) {
            setSelectedIndex(currentIndex);
        }
    }, [location.pathname, bottomNavItems]);

    const handleSelect = (index: number) => {
        setSelectedIndex(index);
        bottomNavItems?.length && history.push(bottomNavItems[index].path);
    };

    return (
        <Navigation.Bottom className='bottom-nav' onChange={(_, index) => handleSelect(index)}>
            {bottomNavItems?.map((item, index) => (
                <Navigation.BottomAction
                    key={index}
                    index={index}
                    activeIcon={<></>}
                    icon={index === selectedIndex ? item.activeIcon : item.icon}
                    label={item.label}
                    selected={index === selectedIndex}
                    showLabel
                    className={clsx(
                        'bottom-nav-item',
                        index === selectedIndex && 'bottom-nav-item--active',
                        item.path === routes.trader_positions && 'bottom-nav-item--positions'
                    )}
                />
            ))}
        </Navigation.Bottom>
    );
};

export default BottomNav;
