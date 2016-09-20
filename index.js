'use strict'

const express = require('express')
const app = express()
const http = require('http')
const lame = require('lame')
const wav = require('wav')
const fs = require('fs')

app.get('/stream/:track_id', function(request,response) {
  let trackId = request.params['track_id']
  console.log('trackId', trackId)

  response.contentType('application/wav')
  response.header('Access-Control-Allow-Origin', '*')
  response.header('Content-Range', 'bytes */*')

  let req = http.get({
    host:'p.scdn.co',
    path:'/mp3-preview/' + trackId,
    headers: {
      'User-Agent': 'node.js'
    }
  }, (res) => {
    let dec = new lame.Decoder()
    dec.on('format', (format) => {
      let writer = new wav.Writer(format)
      let filename = '/var/tmp/' + trackId + '.wav'
      let output = fs.createWriteStream(filename)
      output.on('finish', () => {
        let input = fs.createReadStream(filename)
        input.pipe(response)
      })
      output.on('error', () => {
        console.log('errrrr')
      })
      dec.pipe(writer).pipe(output)
      // dec.pipe(writer).pipe(response)
      // writer.on('error', () => {console.log('err')})
    })

    dec.on('error', () => {console.log('dec err')})

    res.pipe(dec)
  })
})

app.listen(3003)
console.log('Running server on port 3003.')
