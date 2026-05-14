import { HomeAsssistantExtended } from '@types';
import { isString, isObject } from './predicates';

export const fireEvent = (
    node: Element | Document | Window,
    type: string,
    detail: unknown = null,
    options: {
        bubbles?: boolean;
        cancelable?: boolean;
        composed?: boolean;
    } = {}
): void => {
    const {
        // Excluding these branches from coverage
        // There are no tests to cover those branches yet
        /* istanbul ignore next */
        bubbles = true,
        /* istanbul ignore next */
        cancelable = false,
        /* istanbul ignore next */
        composed = true
    } = options;
    node.dispatchEvent(
        new CustomEvent(
            type,
            {
                bubbles,
                cancelable,
                composed,
                detail
            }
        )
    );
};

export const buildFireEventMethods = (ha: HomeAsssistantExtended) => {
    function fireEventMethod(
        node: Element | Document | Window,
        type: string,
        detail: Record<string, unknown>
    ): void
    function fireEventMethod(
        type: string,
        detail?: Record<string, unknown>
    ): void
    function fireEventMethod(
        nodeOrType: Element | Document | Window | string,
        typeOrDetail?: string | Record<string, unknown>,
        detailObject?: Record<string, unknown>
    ): void {
        const node = isString(nodeOrType)
            ? ha
            : nodeOrType;
        const type = isString(nodeOrType)
            ? nodeOrType
            : isString(typeOrDetail)
                ? typeOrDetail
                : null;
        const detail = isObject(typeOrDetail)
            ? typeOrDetail
            : isObject(detailObject)
                ? detailObject
                : undefined;
        if (type === null) {
            throw new SyntaxError('fireEvent method needs a string as event "type"');
        }
        fireEvent(
            node,
            type,
            detail
        );
    }
    return {
        fireEvent: fireEventMethod
    };
};