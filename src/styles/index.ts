import {
    ATTRIBUTE,
    BLOCKED_PROPERTY,
    CUSTOM_SIDEBAR_CSS_VARIABLES,
    ELEMENT,
    HA_CSS_VARIABLES,
    PSEUDO_SELECTOR,
    SELECTOR
} from '@constants';
import { getCSSVariables } from '@utilities';

const BADGE_STYLES = {
    backgroundColor: getCSSVariables(
        CUSTOM_SIDEBAR_CSS_VARIABLES.NOTIFICATION_COLOR,
        HA_CSS_VARIABLES.ACCENT_COLOR
    ),
    color: getCSSVariables(
        CUSTOM_SIDEBAR_CSS_VARIABLES.NOTIFICATION_TEXT_COLOR,
        HA_CSS_VARIABLES.TEXT_ACCENT_COLOR,
        HA_CSS_VARIABLES.TEXT_PRIMARY_COLOR
    ),
    display: 'block',
    maxWidth: '80px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textWrap: 'nowrap',
    zIndex: 1
};

export const FUNCTIONALITY = {
    [`${ SELECTOR.HOST_EXPANDED_NOT_NAROW } ${ SELECTOR.MENU }`]: {
        width: '100%'
    },
    [`${ SELECTOR.HOST_EXPANDED } ${ ELEMENT.ITEM }`]: {
        width: 'calc(100% - var(--ha-space-2)) !important'
    },
    [`${ SELECTOR.HOST_EXPANDED } ${ ELEMENT.ITEM } > ${ ELEMENT.USER_BADGE }`]: {
        zIndex: 1
    },
    [`${ SELECTOR.HOST_EXPANDED } ${ ELEMENT.ITEM } > ${ SELECTOR.ITEM_TEXT }`]: {
        position: 'relative',
        zIndex: 1
    },
    [`${ SELECTOR.HOST_EXPANDED } ${ ELEMENT.ITEM } > ${ SELECTOR.ITEM_TEXT }${ SELECTOR.DATA_INFO }`]: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        lineHeight: '1'
    },
    [`${ SELECTOR.HOST_EXPANDED } ${ ELEMENT.ITEM } > ${ SELECTOR.ITEM_TEXT }${ SELECTOR.DATA_INFO }${ PSEUDO_SELECTOR.AFTER }`]: {
        content: 'attr(data-info)',
        display: 'block',
        fontSize: '11px',
        lineHeight: '1',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    },
    [`${ SELECTOR.HOST } ${ ELEMENT.ITEM }:not([${ ATTRIBUTE.WITH_NOTIFICATION }], ${ SELECTOR.CONFIGURATION }, ${ SELECTOR.SIDEBAR_NOTIFICATIONS }) > ${ SELECTOR.BADGE }`]: {
        display: 'none'
    },
    [`${ SELECTOR.HOST_NOT_EXPANDED } ${ ELEMENT.ITEM }:not([${ ATTRIBUTE.WITH_NOTIFICATION }], ${ SELECTOR.CONFIGURATION }, ${ SELECTOR.SIDEBAR_NOTIFICATIONS }) > ${ SELECTOR.BADGE }`]: {
        display: 'none'
    },
    [`${ SELECTOR.HOST } ${ ELEMENT.ITEM } > ${ SELECTOR.BADGE }`]: BADGE_STYLES,
    [`${ SELECTOR.HOST_NOT_EXPANDED } ${ ELEMENT.ITEM } > ${ SELECTOR.BADGE }`]: {
        ...BADGE_STYLES,
        display: 'flex',
        fontSize: '0.65em',
        justifyContent: 'center',
        left: '26px',
        lineHeight: '2',
        maxWidth: '5px',
        textOverflow: 'unset',
        top: '4px',
        padding: '0 5px',
        position: 'absolute'
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
            'inherit'
        ),
        borderBottomColor: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.DIVIDER_COLOR,
            HA_CSS_VARIABLES.DIVIDER_COLOR
        ),
        borderBottomStyle: 'solid',
        borderBottomWidth: '1px'
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
    [`${ SELECTOR.HOST } ${ SELECTOR.SIDEBAR_TOP_ITEMS_CONTAINER }`]: {
        scrollbarColor: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.SCROLLBAR_THUMB_COLOR,
            HA_CSS_VARIABLES.SCROLLBAR_THUMB_COLOR
        ) + ' transparent'
    },
    [`${ SELECTOR.HOST } ${ SELECTOR.SIDEBAR_TOP_ITEMS_CONTAINER }${ PSEUDO_SELECTOR.WEBKIT_SCROLLBAR_THUMB }`]: {
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
    [`${ SELECTOR.HOST }  ${ ELEMENT.ITEM }:not(${ SELECTOR.ITEM_SELECTED })${ PSEUDO_SELECTOR.BEFORE }`]: {
        background: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.ITEM_BACKGROUND,
            'none'
        ),
        bottom: '0px',
        content: '""',
        borderRadius: '4px',
        display: 'block',
        left: '0px',
        position: 'absolute',
        pointerEvents: 'none',
        right: '0px',
        top: '0px'
    }
};

export const ITEM_BACKGROUND_HOVER_AND_HOVER_OPACITY = {
    [`${ SELECTOR.HOST } ${ SELECTOR.SURFACE }${ PSEUDO_SELECTOR.BEFORE }`]: {
        background: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.ITEM_BACKGROUND_HOVER,
            HA_CSS_VARIABLES.MD_RIPPLE_HOVER_COLOR,
            HA_CSS_VARIABLES.MD_SYS_COLOR_ON_SURFACE,
            '#1d1b20'
        )
    },
    [`${ SELECTOR.HOST } ${ SELECTOR.SURFACE_HOVERED }${ PSEUDO_SELECTOR.BEFORE }`]: {
        opacity: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.ITEM_BACKGROUND_HOVER_OPACITY,
            HA_CSS_VARIABLES.MD_RIPPLE_HOVER_OPACITY,
            '.08'
        )
    }
};

export const ITEM_DIVIDER_ITEM_DIVIDER_COLOR = {
    [`${ SELECTOR.HOST } ${ ELEMENT.ITEM }[${ ATTRIBUTE.WITH_DIVIDER }]`]: {
        marginBottom: '10px',
        paddingBottom: '15px',
        position: 'relative'
    },
    [`${ SELECTOR.HOST } ${ ELEMENT.ITEM }[${ ATTRIBUTE.WITH_DIVIDER }]${ PSEUDO_SELECTOR.AFTER }`]: {
        content: '""',
        backgroundColor: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.DIVIDER_COLOR,
            HA_CSS_VARIABLES.DIVIDER_COLOR
        ),
        bottom: 0,
        height: '1px',
        left: '-4px',
        position: 'absolute',
        right: '-4px'
    },
    [`${ SELECTOR.HOST } ${ ELEMENT.ITEM }${SELECTOR.ITEM_SELECTED}[${ ATTRIBUTE.WITH_DIVIDER }]`]: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0
    },
    [`${ SELECTOR.HOST } ${ ELEMENT.ITEM }${SELECTOR.ITEM_SELECTED}[${ ATTRIBUTE.WITH_DIVIDER }]${ PSEUDO_SELECTOR.BEFORE }`]: {
        bottom: '10px'
    }
};

export const ICON_COLOR = {
    [`${ SELECTOR.HOST } ${ ELEMENT.ITEM } > :is(${ ELEMENT.HA_SVG_ICON }, ${ ELEMENT.HA_ICON })`]: {
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.ICON_COLOR,
            HA_CSS_VARIABLES.SIDEBAR_ICON_COLOR
        )
    }
};

export const ICON_COLOR_SELECTED = {
    [`${ SELECTOR.HOST } ${ ELEMENT.ITEM }${ SELECTOR.ITEM_SELECTED } > :is(${ ELEMENT.HA_SVG_ICON }, ${ ELEMENT.HA_ICON })[slot="start"]`]: {
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.ICON_COLOR_SELECTED,
            HA_CSS_VARIABLES.SIDEBAR_SELECTED_ICON_COLOR
        )
    }
};

export const ICON_COLOR_HOVER = {
    [`${ SELECTOR.HOST } ${ SELECTOR.ITEM_HOVER }:not(${ SELECTOR.ITEM_SELECTED }) > :is(${ ELEMENT.HA_SVG_ICON }, ${ ELEMENT.HA_ICON })`]: {
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.ICON_COLOR_HOVER,
            CUSTOM_SIDEBAR_CSS_VARIABLES.ICON_COLOR,
            HA_CSS_VARIABLES.SIDEBAR_ICON_COLOR
        )
    }
};

export const TEXT_COLOR = {
    [`${ SELECTOR.HOST } ${ ELEMENT.ITEM } > ${ SELECTOR.ITEM_TEXT }`]: {
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.TEXT_COLOR,
            HA_CSS_VARIABLES.SIDEBAR_TEXT_COLOR
        )
    }
};

export const TEXT_COLOR_SELECTED = {
    [`${ SELECTOR.HOST } ${ ELEMENT.ITEM }${ SELECTOR.ITEM_SELECTED } > ${ SELECTOR.ITEM_TEXT }`]: {
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.TEXT_COLOR_SELECTED,
            HA_CSS_VARIABLES.SIDEBAR_SELECTED_TEXT_COLOR
        )
    }
};

export const TEXT_COLOR_HOVER = {
    [`${ SELECTOR.HOST } ${ SELECTOR.ITEM_HOVER }:not(${ SELECTOR.ITEM_SELECTED }) > ${ SELECTOR.ITEM_TEXT }`]: {
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.TEXT_COLOR_HOVER,
            CUSTOM_SIDEBAR_CSS_VARIABLES.TEXT_COLOR,
            HA_CSS_VARIABLES.SIDEBAR_TEXT_COLOR
        )
    }
};

export const SELECTION_BACKGROUND_SELECTION_OPACITY = {
    [`${ SELECTOR.HOST } ${ ELEMENT.ITEM }${ SELECTOR.ITEM_SELECTED }${ PSEUDO_SELECTOR.BEFORE }`]: {
        backgroundColor: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.SELECTION_BACKGROUND,
            CUSTOM_SIDEBAR_CSS_VARIABLES.ICON_COLOR_SELECTED,
            HA_CSS_VARIABLES.SIDEBAR_SELECTED_ICON_COLOR
        ),
        opacity: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.SELECTION_OPACITY,
            HA_CSS_VARIABLES.DIVIDER_OPACITY
        )
    }
};

export const INFO_COLOR = {
    [`${ SELECTOR.HOST_EXPANDED } :is(${ SELECTOR.SIDEBAR_TOP_ITEMS_CONTAINER }, ${ SELECTOR.SIDEBAR_BOTTOM_ITEMS_CONTAINER }) > ${ ELEMENT.ITEM } > ${ SELECTOR.ITEM_TEXT }${ SELECTOR.DATA_INFO }${ PSEUDO_SELECTOR.AFTER }`]: {
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.INFO_COLOR,
            HA_CSS_VARIABLES.SIDEBAR_TEXT_COLOR
        )
    }
};

export const INFO_COLOR_SELECTED = {
    [`${ SELECTOR.HOST_EXPANDED } :is(${ SELECTOR.SIDEBAR_TOP_ITEMS_CONTAINER }, ${ SELECTOR.SIDEBAR_BOTTOM_ITEMS_CONTAINER }) > ${ ELEMENT.ITEM }${ SELECTOR.ITEM_SELECTED } > ${ SELECTOR.ITEM_TEXT }${ SELECTOR.DATA_INFO }${ PSEUDO_SELECTOR.AFTER }`]: {
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.INFO_COLOR_SELECTED,
            HA_CSS_VARIABLES.SIDEBAR_SELECTED_TEXT_COLOR
        )
    }
};

export const INFO_COLOR_HOVER = {
    [`${ SELECTOR.HOST_EXPANDED } :is(${ SELECTOR.SIDEBAR_TOP_ITEMS_CONTAINER }, ${ SELECTOR.SIDEBAR_BOTTOM_ITEMS_CONTAINER }) > ${ SELECTOR.ITEM_HOVER }:not(${ SELECTOR.ITEM_SELECTED }) > ${ SELECTOR.ITEM_TEXT }${ SELECTOR.DATA_INFO }${ PSEUDO_SELECTOR.AFTER }`]: {
        color: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.INFO_COLOR_HOVER,
            CUSTOM_SIDEBAR_CSS_VARIABLES.INFO_COLOR,
            HA_CSS_VARIABLES.SIDEBAR_TEXT_COLOR
        )
    }
};

export const NOTIFICATION_COLOR_SELECTED_NOTIFICATION_TEXT_COLOR_SELECTED = {
    [`${ SELECTOR.HOST } ${ SELECTOR.ITEM_SELECTED } > ${ SELECTOR.BADGE }`]: {
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
    [`${ SELECTOR.HOST } ${ SELECTOR.ITEM_HOVER }:not(${ SELECTOR.ITEM_SELECTED }) > ${ SELECTOR.BADGE }`]: {
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

export const HIDDEN_MENU_BUTTON_IN_NARROW_MODE = {
    [`${ SELECTOR.HA_MENU_BUTTON }`]: false
};

export const SIDEBAR_WIDTH_DESKTOP = {
    [`${ SELECTOR.HOST_EXPANDED_NOT_MODAL }`]: {
        MdcDrawerWidth: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.WIDTH,
            CUSTOM_SIDEBAR_CSS_VARIABLES.WIDTH_EXTENDED,
            'calc(256px + var(--safe-area-inset-left, 0px))'
        )
    }
};

export const SIDEBAR_WIDTH_MOBILE = {
    [`${ SELECTOR.HOST } > ${SELECTOR.MC_DRAWER_MODAL}`]: {
        width: getCSSVariables(
            CUSTOM_SIDEBAR_CSS_VARIABLES.WIDTH,
            CUSTOM_SIDEBAR_CSS_VARIABLES.WIDTH_HIDDEN,
            HA_CSS_VARIABLES.MDC_DRAWER_WIDTH,
            '256px'
        )
    },
    [`${ SELECTOR.HOST } > ${SELECTOR.MC_DRAWER_OPEN_FIX}`]: {
        marginLeft: '0px'
    }
};

export const SIDEBAR_BOTTOM_LIST_EMPTY = {
    [`${ SELECTOR.HOST } > ${ SELECTOR.SIDEBAR_BOTTOM_ITEMS_CONTAINER }[${ ATTRIBUTE.EMPTY }]`]: {
        display: 'none'
    }
};