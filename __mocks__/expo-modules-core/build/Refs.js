export default {
    createNullRef: () => ({
        current: null,
        v: null
    }),
    createValueRef: (v) => ({
        current: v,
        v
    })
 };