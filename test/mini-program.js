export const Page = fn => options => fn.call(null, options)
export const App = fn => options => fn.call(null, options)

export const getCurrentPages = () => []