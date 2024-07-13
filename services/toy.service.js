
import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

export const toyService = {
    query,
    getById,
    remove,
    save,
    // getLabels
}

const gToys = utilService.readJsonFile('data/toy.json')

function query(filterBy = {}) {
    var filteredToys = gToys
    if (!filterBy) return Promise.resolve(filteredToys)
    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        filteredToys = filteredToys.filter(toy => regExp.test(toy.name))
    }
    if (filterBy.maxPrice) {
        filteredToys = filteredToys.filter(toy => toy.price <= filterBy.maxPrice)
    }
    if (filterBy.inStock) {
        filteredToys = filteredToys.filter(toy => toy.inStock === JSON.parse(filterBy.inStock))
    }
    // if (filterBy.inStock && filterBy.inStock !== 'all') {
    //     filteredToys = filteredToys.filter((toy) => (filterBy.inStock === 'inStock' ? toy.inStock : !toy.inStock))
    // }

    if (filterBy.labels && filterBy.labels.length) {
    // if (filterBy.labels && filterBy.labels.length > 0) {
        filteredToys = filteredToys.filter(toy => filterBy.labels.every(label => toy.labels.includes(label)))
    }
    // Sorting
    if (filterBy.sortBy) {
        if(!filterBy.sortDir) filterBy.sortDir = 1
        if (filterBy.sortBy === 'name') {
            filteredToys = filteredToys.sort((toy1, toy2) => toy1.name.localeCompare(toy2.name) * filterBy.sortDir)
        } else if (filterBy.sortBy === 'price') {
            filteredToys = filteredToys.sort((toy1, toy2) => (toy1.price - toy2.price) * filterBy.sortDir)
        } else if (filterBy.sortBy === 'createdAt') {
            filteredToys = filteredToys.sort((toy1, toy2) => (toy1.createdAt - toy2.createdAt) * filterBy.sortDir)
        }
    }

    return Promise.resolve(filteredToys)
}

function getById(toyId) {
    const toy = gToys.find(toy => toy._id === toyId)
    return Promise.resolve(toy)
}

function remove(toyId) {
    const idx = gToys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('No Such Toy')
   
    gToys.splice(idx, 1)
    return _saveToysToFile()
}

function save(toyToSave) {
    if (toyToSave._id) {
        const existingToyIdx = gToys.findIndex(toy => toy._id === toyToSave._id)
        if (existingToyIdx === -1) return Promise.reject('No Such Toy')
        
        gToys[existingToyIdx] = { ...gToys[existingToyIdx], ...toyToSave }
    } else {
        toyToSave._id = utilService.makeId()
        toyToSave.createdAt = Date.now()
        gToys.unshift(toyToSave)
        // gToys.push(toyToSave)
    }
    
    return _saveToysToFile().then(() => toyToSave)
}

// function getLabels() {
//     return query().then(toys => {
//         const toysLabels = toys.reduce((acc, toy) => {
//             return [...acc, ...toy.labels]
//         }, [])
//         return [...new Set(toysLabels)]
//     })
// }

function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(gToys, null, 4)
        fs.writeFile('data/toy.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to toys file', err)
                return reject(err)
            }
            resolve()
        })
    })
}
