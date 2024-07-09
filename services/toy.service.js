
import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

export const toyService = {
    query,
    getById,
    remove,
    save,
    getLabels
}

const gToys = utilService.readJsonFile('data/toy.json')

function query(filterBy = {}) {
    var filteredToys = gToys
    if (!filterBy) return Promise.resolve(filteredToys)
    // Filtering by text
    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        filteredToys = filteredToys.filter(toy => regExp.test(toy.name))
    }
    // Filtering by max price
    if (filterBy.maxPrice) {
        filteredToys = filteredToys.filter(toy => toy.price <= filterBy.maxPrice)
    }
    // Filter by whether it is in stock
    if (filterBy.inStock && filterBy.inStock !== 'all') {
        filteredToys = filteredToys.filter((toy) => (filterBy.inStock === 'inStock' ? toy.inStock : !toy.inStock))
    }

    // Filtering by labels
    if (filterBy.labels && filterBy.labels.length > 0) {
        // if (filterBy.labels?.length) {
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

function save(toy) {
    if (toy._id) {
        const toyToUpdate = gToys.find(currToy => currToy._id === toy._id)
        
        toyToUpdate.name = toy.name
        toyToUpdate.price = toy.price
        toy = toyToUpdate
    } else {
        toy._id = utilService.makeId()
        toy.createdAt = Date.now()
        gToys.unshift(toy)
        // gToys.push(toy)
    }
    
    return _saveToysToFile().then(() => toy)
}

function getLabels() {
    return query().then(toys => {
        const toysLabels = toys.reduce((acc, toy) => {
            return [...acc, ...toy.labels]
        }, [])
        return [...new Set(toysLabels)]
    })
}

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
