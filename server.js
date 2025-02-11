import path from 'path';
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import { toyService } from './services/toy.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()

// App Configuration
app.use(express.static('public'))
app.use(cookieParser()) // for res.cookies
app.use(express.json()) // for req.body

const corsOptions = {
    origin: [
        'http://127.0.0.1:3000',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://localhost:5173',
    ],
    credentials: true
}
app.use(cors(corsOptions))

// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static('public'))
// } else {
//     const corsOptions = {
//         origin: [
//             'http://127.0.0.1:3000',
//             'http://localhost:3000',
//             'http://localhost:5173',
//             'http://127.0.0.1:5173',
//         ],
//         credentials: true,
//     }
//     app.use(cors(corsOptions))
// }

// REST API for Toys

// Toy LIST
app.get('/api/toy', (req, res) => {
    const filterBy = {
        txt: req.query.txt || '',
        maxPrice: +req.query.maxPrice || 0,
        inStock: req.query.inStock || '',
        labels: req.query.labels || [],
        sortBy: req.query.sortBy || '',
        sortDir: +req.query.sortDir || 1,
    }
    toyService.query(filterBy)
        .then((toys) => {
            res.send(toys)
        })
        .catch((err) => {
            loggerService.error('Cannot get toys', err)
            res.status(400).send('Cannot get toys')
        })
})

// Toy READ
app.get('/api/toy/:toyId', (req, res) => {
    const { toyId } = req.params
    toyService.getById(toyId)
        .then((toy) => {
            res.send(toy)
        })
        .catch((err) => {
            loggerService.error('Cannot get toy', err)
            res.status(400).send('Cannot get toy')
        })
})

// Toy CREATE
app.post('/api/toy', (req, res) => {
    const toyToSave = {
        name: req.body.name || '',
        price: +req.body.price || 0,
        labels: req.body.labels || [],
        // createdAt: +req.body.createdAt || 0,
        // inStock: req.body.inStock || '',
    }
    toyService.save(toyToSave)
        .then((savedToy) => {
            res.send(savedToy)
        })
        .catch((err) => {
            loggerService.error('Cannot save toy', err)
            res.status(400).send('Cannot save toy')
        })

})

// Toy UPDATE
app.put('/api/toy', (req, res) => {
    const toyToSave = {
        _id: req.body._id,
        name: req.body.name || '',
        price: +req.body.price || 0,
        labels: req.body.labels || [],
        // createdAt: +req.body.createdAt || 0,
        inStock: req.body.inStock || '',
    }
    toyService.save(toyToSave)
        .then((savedToy) => {
            res.send(savedToy)
        })
        .catch((err) => {
            loggerService.error('Cannot save toy', err)
            res.status(400).send('Cannot save toy')
        })

})

// Toy DELETE
app.delete('/api/toy/:toyId', (req, res) => {
    const { toyId } = req.params
    toyService.remove(toyId)
        .then(() => {
            loggerService.info(`Toy ${toyId} removed`)
            res.send('Removed!')
        })
        .catch((err) => {
            loggerService.error('Cannot remove toy', err)
            res.status(400).send('Cannot remove toy')
        })

})



app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})


const port= process.env.PORT || 3030
app.listen(port, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
)
