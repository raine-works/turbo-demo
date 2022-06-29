export const generateQueryString = (obj: any) => {
	let dataMap: string = '{'
	for (let prop of Object.keys(obj)) {
		dataMap += `${prop}:$${prop}`
		if (Object.keys(obj).indexOf(prop) === Object.keys(obj).length - 1) {
			dataMap += '}'
		} else {
			dataMap += ', '
		}
	}
	return dataMap
}
