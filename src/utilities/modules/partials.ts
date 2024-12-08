import { NAMESPACE, PARTIAL_REGEXP } from '@constants';

export const getTemplateWithPartials = (
    template: string,
    partials: Record<string, string> | undefined,
    tree: string[] = []
): string => {
    return template.replace(PARTIAL_REGEXP, (__match: string, partial: string): string => {
        if (partials?.[partial]) {
            if (tree.includes(partial)) {
                throw new SyntaxError(`${NAMESPACE}: circular partials dependency ${tree.join(' > ')} > ${ partial }`);
            }
            return getTemplateWithPartials(
                partials[partial].trim(),
                partials,
                [...tree, partial]
            );
        }
        console.warn(`${NAMESPACE}: partial ${partial} doesn't exist`);
        return '';
    });
};

