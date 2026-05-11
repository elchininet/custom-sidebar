export const fireEvent = (
    node: Element | Window,
    type: string,
    detail: Record<string, unknown>
) => {
    node.dispatchEvent(
        new CustomEvent(
            type,
            {
                detail
            }
        )
    );
};