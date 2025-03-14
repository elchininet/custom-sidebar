import {
    ATTRIBUTE,
    ELEMENT,
    SELECTOR,
    PSEUDO_SELECTOR,
    CUSTOM_SIDEBAR_CSS_VARIABLES,
    HA_CSS_VARIABLES,
    BLOCKED_PROPERTY
} from '@constants';
import { getCSSVariables } from '@utilities';

const NOTIFICATION_COLOR_NOTIFICATION_TEXT_COLOR = {
    backgroundColor: getCSSVariables(
        CUSTOM_SIDEBAR_CSS_VARIABLES.NOTIFICATION_COLOR,
        HA_CSS_VARIABLES.ACCENT_COLOR
    ),
    borderRadius: '20px',
    color: getCSSVariables(
        CUSTOM_SIDEBAR_CSS_VARIABLES.NOTIFICATION_TEXT_COLOR,
        HA_CSS_VARIABLES.TEXT_ACCENT_COLOR,
        HA_CSS_VARIABLES.TEXT_PRIMARY_COLOR
    ),
    fontSize: '0.65em',
    overflow: 'hidden',
    padding: '0px 5px',
    textOverflow: 'ellipsis',
    textWrap: 'nowrap'
};

export const FUNCTIONALITY = {
    [`${ SELECTOR.HOST } ${ SELECTOR.ITEM }[${ ATTRIBUTE.WITH_NOTIFICATION }] > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.ITEM_TEXT }`]: {
        maxWidth: 'calc(100% - 100px)'
    },
    [`${ SELECTOR.HOST_EXPANDED } ${ ELEMENT.PAPER_LISTBOX } > ${ SELECTOR.ITEM } > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.ITEM_TEXT }`]: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        lineHeight: '1'
    },
    [`${ SELECTOR.HOST_EXPANDED } ${ ELEMENT.PAPER_LISTBOX } > ${ SELECTOR.ITEM } > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.ITEM_TEXT }${ PSEUDO_SELECTOR.AFTER }`]: {
        content: 'attr(data-info)',
        display: 'none',
        fontSize: '11px',
        lineHeight: '1',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    [`${ SELECTOR.HOST_EXPANDED } ${ ELEMENT.PAPER_LISTBOX } > ${ SELECTOR.ITEM } > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.NOTIFICATIONS_BADGE_COLLAPSED }`]: {
        opacity: '0'
    },
    [`${ SELECTOR.HOST_EXPANDED } ${ ELEMENT.PAPER_LISTBOX } > ${ SELECTOR.ITEM }${ SELECTOR.ITEM_SELECTED } > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.ITEM_TEXT }`]: {
        zIndex: '1'
    },
    [`${ SELECTOR.HOST } ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.NOTIFICATION_BADGE }:not(${ SELECTOR.NOTIFICATIONS_BADGE_COLLAPSED })`]: {
        ...NOTIFICATION_COLOR_NOTIFICATION_TEXT_COLOR
    },
    [`${ SELECTOR.HOST } ${ ELEMENT.PAPER_ICON_ITEM }:not(${ SELECTOR.SIDEBAR_NOTIFICATIONS }) > ${ SELECTOR.NOTIFICATION_BADGE }:not(${ SELECTOR.NOTIFICATIONS_BADGE_COLLAPSED })`]: {
        left: 'calc(var(--app-drawer-width, 248px) - 22px)',
        maxWidth: '80px',
        transform: 'translateX(-100%)'
    },
    [`${ SELECTOR.HOST } ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.NOTIFICATIONS_BADGE_COLLAPSED }`]: {
        ...NOTIFICATION_COLOR_NOTIFICATION_TEXT_COLOR,
        display: 'flex',
        bottom: '14px',
        justifyContent: 'center',
        left: '26px',
        maxWidth: '20px',
        textOverflow: 'unset'
    },
    [`${ SELECTOR.HOST } ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.CONFIGURATION_BADGE }`]: {
        ...NOTIFICATION_COLOR_NOTIFICATION_TEXT_COLOR
    }
};

export const TITLE_COLOR = {
    [`${ SELECTOR.HOST } ${ SELECTOR.MENU } > ${ SELECTOR.TITLE }`]: {
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.TITLE_COLOR,
            HA_CSS_VARIABLES.SIDEBAR_TITLE_COLOR,
            HA_CSS_VARIABLES.PRIMARY_TEXT_COLOR
        )
    }
};

export const SUBTITLE_COLOR = {
    [`${ SELECTOR.HOST } ${ SELECTOR.MENU } > ${ SELECTOR.TITLE }${ PSEUDO_SELECTOR.AFTER }`]: {
        content: 'attr(data-subtitle)',
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.SUBTITLE_COLOR,
            CUSTOM_SIDEBAR_CSS_VARIABLES.TITLE_COLOR,
            HA_CSS_VARIABLES.SIDEBAR_TITLE_COLOR,
            HA_CSS_VARIABLES.PRIMARY_TEXT_COLOR
        ),
        display: 'block',
        fontSize: '12px',
        lineHeight: '1.5'
    }
};

export const SIDEBAR_BUTTON_COLOR = {
    [`${ SELECTOR.HOST } ${ SELECTOR.MENU } > ${ ELEMENT.HA_ICON_BUTTON }`]: {
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.BUTTON_COLOR,
            HA_CSS_VARIABLES.SIDEBAR_ICON_COLOR
        )
    }
};

export const SIDEBAR_BACKGROUND = {
    [SELECTOR.HOST]: {
        background: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.BACKGROUND,
            HA_CSS_VARIABLES.SIDEBAR_BACKGROUND_COLOR
        ) + ' !important'
    }
};

export const MENU_BACKGROUND_DIVIDER_TOP_COLOR = {
    [`${ SELECTOR.HOST } ${ SELECTOR.MENU }`]: {
        background: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.MENU_BACKGROUND,
            CUSTOM_SIDEBAR_CSS_VARIABLES.BACKGROUND,
            HA_CSS_VARIABLES.SIDEBAR_MENU_BUTTON_BACKGROUND_COLOR,
            HA_CSS_VARIABLES.PRIMARY_BACKGROUND_COLOR
        ),
        borderBottomColor: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.DIVIDER_TOP_COLOR,
            CUSTOM_SIDEBAR_CSS_VARIABLES.DIVIDER_COLOR,
            HA_CSS_VARIABLES.DIVIDER_COLOR
        ),
        borderBottomStyle: 'solid',
        borderBottomWidth: '1px'
    }
};

export const DIVIDER_BOTTOM_COLOR_DIVIDER_COLOR = {
    [`${ SELECTOR.HOST } ${ SELECTOR.DIVIDER }${ PSEUDO_SELECTOR.BEFORE }`]: {
        backgroundColor: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.DIVIDER_BOTTOM_COLOR,
            CUSTOM_SIDEBAR_CSS_VARIABLES.DIVIDER_COLOR,
            HA_CSS_VARIABLES.DIVIDER_COLOR
        )
    }
};

export const SIDEBAR_BORDER_COLOR = {
    [`${ SELECTOR.HOST } > ${SELECTOR.MC_DRAWER}`]: {
        borderColor: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.BORDER_COLOR,
            HA_CSS_VARIABLES.DIVIDER_COLOR,
            'rgba(0,0,0,.12)'
        )
    }
};

export const SCROLL_THUMB_COLOR = {
    [`${ SELECTOR.HOST } ${ ELEMENT.PAPER_LISTBOX }${ SELECTOR.HA_SCROLLBAR }`]: {
        scrollbarColor: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.SCROLLBAR_THUMB_COLOR,
            HA_CSS_VARIABLES.SCROLLBAR_THUMB_COLOR
        ) + ' transparent'
    },
    [`${ SELECTOR.HOST } ${ ELEMENT.PAPER_LISTBOX }${ SELECTOR.HA_SCROLLBAR }${ PSEUDO_SELECTOR.WEBKIT_SCROLLBAR_THUMB }`]: {
        background: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.SCROLLBAR_THUMB_COLOR,
            HA_CSS_VARIABLES.SCROLLBAR_THUMB_COLOR
        )
    }
};

export const SIDEBAR_EDITABLE = {
    [`${ SELECTOR.MENU }[${ BLOCKED_PROPERTY }]`]: {
        pointerEvents: 'none'
    },
    [`${ SELECTOR.MENU }[${ BLOCKED_PROPERTY }] > ${ ELEMENT.HA_ICON_BUTTON }`]: {
        pointerEvents: 'all'
    }
};

export const ITEM_BACKGROUND = {
    [`${ SELECTOR.HOST } ${ SELECTOR.ITEM }:not(${ SELECTOR.ITEM_SELECTED }) > ${ ELEMENT.PAPER_ICON_ITEM }`]: {
        background: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.ITEM_BACKGROUND,
            'none'
        )
    }
};

export const ITEM_BACKGROUND_HOVER = {
    [`${ SELECTOR.HOST } :is(${ SELECTOR.ITEM_HOVER }, ${ SELECTOR.SIDEBAR_NOTIFICATIONS_CONTAINER_HOVER }):not(${ SELECTOR.ITEM_SELECTED }) > ${ ELEMENT.PAPER_ICON_ITEM }`]: {
        background: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.ITEM_BACKGROUND_HOVER,
            CUSTOM_SIDEBAR_CSS_VARIABLES.ITEM_BACKGROUND,
            'none'
        )
    }
};

export const ITEM_DIVIDER_ITEM_DIVIDER_COLOR = {
    [`${ SELECTOR.HOST } ${ SELECTOR.ITEM }[${ ATTRIBUTE.WITH_DIVIDER }]`]: {
        borderBottom: '1px solid',
        borderBottomColor: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.DIVIDER_COLOR,
            HA_CSS_VARIABLES.DIVIDER_COLOR
        ),
        marginBottom: '10px',
        paddingBottom: '10px'
    },
    [`${ SELECTOR.HOST } ${ SELECTOR.ITEM }:not(${SELECTOR.ITEM_SELECTED})[${ ATTRIBUTE.WITH_DIVIDER }]:focus::before`]: {
        bottom: '10px'
    }
};

export const ICON_COLOR = {
    [`${ SELECTOR.HOST } ${ ELEMENT.PAPER_ICON_ITEM } > :is(${ ELEMENT.HA_SVG_ICON }, ${ ELEMENT.HA_ICON })`]: {
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.ICON_COLOR,
            HA_CSS_VARIABLES.SIDEBAR_ICON_COLOR
        )
    }
};

export const ICON_COLOR_SELECTED = {
    [`${ SELECTOR.HOST } ${ SELECTOR.ITEM_SELECTED } > ${ ELEMENT.PAPER_ICON_ITEM } > :is(${ ELEMENT.HA_SVG_ICON }, ${ ELEMENT.HA_ICON })`]: {
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.ICON_COLOR_SELECTED,
            HA_CSS_VARIABLES.SIDEBAR_SELECTED_ICON_COLOR
        )
    }
};

export const ICON_COLOR_HOVER = {
    [`${ SELECTOR.HOST } :is(${ SELECTOR.ITEM_HOVER }, ${ SELECTOR.SIDEBAR_NOTIFICATIONS_CONTAINER_HOVER }):not(${ SELECTOR.ITEM_SELECTED }) > ${ ELEMENT.PAPER_ICON_ITEM } > :is(${ ELEMENT.HA_SVG_ICON }, ${ ELEMENT.HA_ICON })`]: {
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.ICON_COLOR_HOVER,
            CUSTOM_SIDEBAR_CSS_VARIABLES.ICON_COLOR,
            HA_CSS_VARIABLES.SIDEBAR_ICON_COLOR
        )
    }
};

export const TEXT_COLOR = {
    [`${ SELECTOR.HOST } ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.ITEM_TEXT }`]: {
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.TEXT_COLOR,
            HA_CSS_VARIABLES.SIDEBAR_TEXT_COLOR
        )
    }
};

export const TEXT_COLOR_SELECTED = {
    [`${ SELECTOR.HOST } ${ SELECTOR.ITEM_SELECTED } > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.ITEM_TEXT }`]: {
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.TEXT_COLOR_SELECTED,
            HA_CSS_VARIABLES.SIDEBAR_SELECTED_TEXT_COLOR
        )
    }
};

export const TEXT_COLOR_HOVER = {
    [`${ SELECTOR.HOST } :is(${ SELECTOR.ITEM_HOVER }, ${ SELECTOR.SIDEBAR_NOTIFICATIONS_CONTAINER_HOVER }):not(${ SELECTOR.ITEM_SELECTED }) > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.ITEM_TEXT }`]: {
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.TEXT_COLOR_HOVER,
            CUSTOM_SIDEBAR_CSS_VARIABLES.TEXT_COLOR,
            HA_CSS_VARIABLES.SIDEBAR_TEXT_COLOR
        )
    }
};

export const SELECTION_BACKGROUND_SELECTION_OPACITY = {
    [`${ SELECTOR.HOST } :is(${ SELECTOR.ITEM }, ${ SELECTOR.SIDEBAR_NOTIFICATIONS_CONTAINER }) > ${ ELEMENT.PAPER_ICON_ITEM }${ PSEUDO_SELECTOR.BEFORE }`]: {
        background: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.SELECTION_BACKGROUND,
            CUSTOM_SIDEBAR_CSS_VARIABLES.ICON_COLOR_SELECTED,
            HA_CSS_VARIABLES.SIDEBAR_SELECTED_ICON_COLOR
        ),
        opacity: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.SELECTION_OPACITY,
            '0.12'
        )
    }
};

export const INFO_COLOR = {
    [`${ SELECTOR.HOST_EXPANDED } ${ ELEMENT.PAPER_LISTBOX } > ${ SELECTOR.ITEM } > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.ITEM_TEXT }${ SELECTOR.DATA_INFO }${ PSEUDO_SELECTOR.AFTER }`]: {
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.INFO_COLOR,
            HA_CSS_VARIABLES.SIDEBAR_TEXT_COLOR
        ),
        display: 'block'
    }
};

export const INFO_COLOR_SELECTED = {
    [`${ SELECTOR.HOST_EXPANDED } ${ ELEMENT.PAPER_LISTBOX } > ${ SELECTOR.ITEM }${ SELECTOR.ITEM_SELECTED } > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.ITEM_TEXT }${ SELECTOR.DATA_INFO }${ PSEUDO_SELECTOR.AFTER }`]: {
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.INFO_COLOR_SELECTED,
            HA_CSS_VARIABLES.SIDEBAR_SELECTED_TEXT_COLOR
        )
    }
};

export const INFO_COLOR_HOVER = {
    [`${ SELECTOR.HOST_EXPANDED } :is(${ SELECTOR.ITEM_HOVER }, ${ SELECTOR.SIDEBAR_NOTIFICATIONS_CONTAINER_HOVER }):not(${ SELECTOR.ITEM_SELECTED }) > ${ ELEMENT.PAPER_ICON_ITEM } > ${ SELECTOR.ITEM_TEXT }${ SELECTOR.DATA_INFO }${ PSEUDO_SELECTOR.AFTER }`]: {
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.INFO_COLOR_HOVER,
            CUSTOM_SIDEBAR_CSS_VARIABLES.INFO_COLOR,
            HA_CSS_VARIABLES.SIDEBAR_TEXT_COLOR
        )
    }
};

export const NOTIFICATION_COLOR_SELECTED_NOTIFICATION_TEXT_COLOR_SELECTED = {
    [`${ SELECTOR.HOST } ${ SELECTOR.ITEM_SELECTED } > ${ ELEMENT.PAPER_ICON_ITEM } > :is(${ SELECTOR.NOTIFICATION_BADGE }, ${ SELECTOR.CONFIGURATION_BADGE })`]: {
        backgroundColor: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.NOTIFICATION_COLOR_SELECTED,
            CUSTOM_SIDEBAR_CSS_VARIABLES.NOTIFICATION_COLOR,
            HA_CSS_VARIABLES.ACCENT_COLOR
        ),
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.NOTIFICATION_TEXT_COLOR_SELECTED,
            CUSTOM_SIDEBAR_CSS_VARIABLES.NOTIFICATION_TEXT_COLOR,
            HA_CSS_VARIABLES.TEXT_ACCENT_COLOR,
            HA_CSS_VARIABLES.TEXT_PRIMARY_COLOR
        )
    }
};

export const NOTIFICATION_COLOR_HOVER_NOTIFICATION_TEXT_COLOR_HOVER = {
    [`${ SELECTOR.HOST } :is(${ SELECTOR.ITEM_HOVER }, ${ SELECTOR.SIDEBAR_NOTIFICATIONS_CONTAINER_HOVER }):not(${ SELECTOR.ITEM_SELECTED }) > ${ ELEMENT.PAPER_ICON_ITEM } > :is(${ SELECTOR.NOTIFICATION_BADGE }, ${ SELECTOR.CONFIGURATION_BADGE })`]: {
        backgroundColor: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.NOTIFICATION_COLOR_HOVER,
            CUSTOM_SIDEBAR_CSS_VARIABLES.NOTIFICATION_COLOR,
            HA_CSS_VARIABLES.ACCENT_COLOR
        ),
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.NOTIFICATION_TEXT_COLOR_HOVER,
            CUSTOM_SIDEBAR_CSS_VARIABLES.NOTIFICATION_TEXT_COLOR,
            HA_CSS_VARIABLES.TEXT_ACCENT_COLOR,
            HA_CSS_VARIABLES.TEXT_PRIMARY_COLOR
        )
    }
};