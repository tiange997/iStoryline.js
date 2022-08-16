import { drawStoryline } from '../../src/js/utils/drawer'
import { shapeCovering } from '../../src/js/shapeCovering'
import { none } from 'html-webpack-plugin/lib/chunksorter'
import iStoryline from '../../src/js'
import * as d3Fetch from 'd3-fetch'
import Snap from 'snapsvg'
import $ from 'jquery'

main('Match5/test1.json')

// Initialise json files
const jsonRead = d3Fetch.json('../../data/json/Match5/MatchInfo.json') // Info of match
const jsonReadTwo = d3Fetch.json('../../data/json/Match5/killingInfo.json') // Killing info file generated by python
const jsonDBSCAN = d3Fetch.json('../../data/json/Match5/dbscan.json') // DBSCAN result

// Screen Width and Height
const width = 6000
const height = 1080

// We need to set the total timestamp first
// Sections decide how the interval of timeline display
let totalTimestamp
let sections

// Canvas Origin
let xOrigin = 350,
  yOrigin = 60

// We have to hard-code this part as we manually define colours
// Saving this for decorating circles
/*let playerColour = {
  Player1: '#5B7DB1',
  Player2: '#00B8D1',
  Player3: '#00B827',
  Player4: '#5BB58A',
  Player5: '#9B8BD6',
  Player6: '#ff0000',
  Player7: '#ba000d',
  Player8: '#ff94c2',
  Player9: '#ffa000',
  Player10: '#ffd149',
}*/

/*let playerColour = {
  Player1: '#6A3D9A', // changed
  Player2: '#00B8D1',
  Player3: '#00B827',
  Player4: '#5BB58A',
  Player5: '#9B8BD6',
  Player6: '#ff0000',
  Player7: '#ba000d',
  Player8: '#ff94c2',
  Player9: '#FF7F00', // changed
  Player10: '#ffd149',
}*/

let playerColour = {
  Player1: '#ff0000', // changed
  Player2: '#ba000d',
  Player3: '#ff94c2',
  Player4: '#FF7F00',
  Player5: '#ffd149',
  Player6: '#6A3D9A',
  Player7: '#00B8D1',
  Player8: '#00B827',
  Player9: '#5BB58A', // changed
  Player10: '#9B8BD6',
}

// Save location info for later use
let locationSet

let mySvg = $('#mySvg')[0]

let pt = mySvg.createSVGPoint()

const svg = Snap('#mySvg')
svg.attr({ viewBox: '0 0 6500 1200' })

async function main(fileName) {
  const iStorylineInstance = new iStoryline()
  const fileUrl = `../../data/${fileName.split('.')[1]}/${fileName}`
  let graph = await iStorylineInstance.loadFile(fileUrl)
  let dbSCANData

  // Read Json through the Promise and save participants data

  let participantsInfoData = await jsonRead.then(function(result) {
    return result['info']['participants']
  })

  let participantsInfo = []

  for (const element of participantsInfoData) {
    participantsInfo.push(element['participantId'], element['championName'])
  }

  let nexusKiller = null
  let nexusKillerId = null

  for (const element of participantsInfoData) {
    if (element['nexusKills'] == 1) {
      nexusKillerId = element['participantId']
      nexusKiller = 'Player' + nexusKillerId
    }
  }

  console.log(nexusKiller)

  let dbscan = await jsonDBSCAN.then(function(result) {
    dbSCANData = result
  })

  // Scale to window size
  const containerDom = document.getElementById('mySvg')
  const windowW = containerDom.clientWidth - 20
  const windowH = containerDom.clientHeight - 20
  // graph = iStorylineInstance.scale(80, 10, windowW / 1.2 , windowH / 1.5)
  graph = iStorylineInstance.scale(xOrigin, yOrigin, width, height)

  // logStoryInfo(iStorylineInstance._story)

  const session = iStorylineInstance._story._tableMap.get('session')._mat._data

  const characters = graph.characters

  let useMode

  locationSet = iStorylineInstance._story._locations

  if (locationSet.length === 6) {
    useMode = 0 // simple mode with 6 divisions
  } else if (locationSet.length === 7) {
    useMode = 1 // simple mode with 7 divisions
  } else if (locationSet.length === 17) {
    useMode = 2 // complex mode with 17 divisions
  } else {
    warn('Wrong JSON File!')
  }

  heroInfo(characters, participantsInfo, useMode)

  locationBox(locationSet, useMode)

  drawDBSCAN(dbSCANData, graph)

  const storylines = graph.storylines

  // Timestamp
  const timestamps = iStorylineInstance._story._timeStamps
  totalTimestamp = timestamps[timestamps.length - 1]

  console.log('Match Length: ' + timeStamp(totalTimestamp))

  // convert the last timestamp into minutes

  let min = Math.floor((totalTimestamp / 1000 / 60) << 0),
    sec = Math.floor((totalTimestamp / 1000) % 60)

  // console.log(min + ':' + sec)

  const perTimeStamp = totalTimestamp / 10 //divided by 10

  let perMin = Math.floor((perTimeStamp / 1000 / 60) << 0),
    perSec = Math.floor((perTimeStamp / 1000) % 60)

  // console.log('Per timestamp: ' + perMin + ':' + perSec)

  timeline()

  storylines.forEach((storyline, idx) => {
    drawStoryline(
      characters[idx],
      storyline,
      session,
      locationSet,
      perTimeStamp,
      participantsInfo
    )
  })

  await drawEvents(graph, participantsInfo, nexusKiller, nexusKillerId)

  $('#tip').remove()

  return iStorylineInstance
}

// Draw hero info
function heroInfo(character, participantsInfo, useMode) {
  console.log(participantsInfo)
  let playerImg = []
  for (let i = 0; i < character.length; i++) {
    playerImg[i] = `../../src/image/Champions/${
      participantsInfo[i * 2 + 1]
    }Square.png`
  }

  const teamOneX = 30
  const teamOneY = 50
  const borderOffset = 5

  const iconSize = 42
  const borderSize = 52

  const horizontalAdj = 70
  const verticalAdj = 110

  const yOffset = 70

  let icon = svg.image(playerImg[0], teamOneX, teamOneY, iconSize, iconSize)
  svg.text(teamOneX - 10, teamOneY + yOffset, participantsInfo[1]).attr({
    fill: playerColour['Player1'],
  })

  // Add decorative border according to the color scheme
  svg
    .rect(
      teamOneX - borderOffset,
      teamOneY - borderOffset,
      borderSize,
      borderSize
    )
    .attr({
      fill: 'none',
      stroke: playerColour['Player1'],
      'stroke-width': '5',
      opacity: 0.7,
    })

  let iconTwo = svg.image(
    playerImg[1],
    teamOneX + horizontalAdj,
    teamOneY,
    iconSize,
    iconSize
  )

  svg
    .text(teamOneX + horizontalAdj, teamOneY + yOffset, participantsInfo[3])
    .attr({
      fill: playerColour['Player2'],
    })

  svg
    .rect(
      teamOneX - borderOffset + horizontalAdj,
      teamOneY - borderOffset,
      borderSize,
      borderSize
    )
    .attr({
      fill: 'none',
      stroke: playerColour['Player2'],
      'stroke-width': '5',
      opacity: 0.7,
    })

  let iconThree = svg.image(
    playerImg[2],
    teamOneX,
    teamOneY + verticalAdj,
    iconSize,
    iconSize
  )

  svg
    .text(teamOneX - 10, teamOneY + verticalAdj + yOffset, participantsInfo[5])
    .attr({
      fill: playerColour['Player3'],
    })

  svg
    .rect(
      teamOneX - borderOffset,
      teamOneY - borderOffset + verticalAdj,
      borderSize,
      borderSize
    )
    .attr({
      fill: 'none',
      stroke: playerColour['Player3'],
      'stroke-width': '5',
      opacity: 0.7,
    })

  let iconFour = svg.image(
    playerImg[3],
    teamOneX + horizontalAdj,
    teamOneY + verticalAdj,
    iconSize,
    iconSize
  )

  svg
    .text(
      teamOneX + horizontalAdj,
      teamOneY + verticalAdj + yOffset,
      participantsInfo[7]
    )
    .attr({
      fill: playerColour['Player4'],
    })

  svg
    .rect(
      teamOneX - borderOffset + horizontalAdj,
      teamOneY - borderOffset + verticalAdj,
      borderSize,
      borderSize
    )
    .attr({
      fill: 'none',
      stroke: playerColour['Player4'],
      'stroke-width': '5',
      opacity: 0.7,
    })

  let iconFive = svg.image(
    playerImg[4],
    teamOneX,
    teamOneY + verticalAdj * 2,
    iconSize,
    iconSize
  )

  svg
    .text(
      teamOneX - 10,
      teamOneY + verticalAdj * 2 + yOffset,
      participantsInfo[9]
    )
    .attr({
      fill: playerColour['Player5'],
    })

  svg
    .rect(
      teamOneX - borderOffset,
      teamOneY - borderOffset + verticalAdj * 2,
      borderSize,
      borderSize
    )
    .attr({
      fill: 'none',
      stroke: playerColour['Player5'],
      'stroke-width': '5',
      opacity: 0.7,
    })

  const teamTwoX = teamOneX
  const teamTwoY = 850

  let iconSix = svg.image(playerImg[5], teamTwoX, teamTwoY, iconSize, iconSize)
  svg.text(teamTwoX - 10, teamTwoY + yOffset, participantsInfo[11]).attr({
    fill: playerColour['Player6'],
  })

  svg
    .rect(
      teamTwoX - borderOffset,
      teamTwoY - borderOffset,
      borderSize,
      borderSize
    )
    .attr({
      fill: 'none',
      stroke: playerColour['Player6'],
      'stroke-width': '5',
      opacity: 0.7,
    })

  let iconSeven = svg.image(
    playerImg[6],
    teamTwoX + horizontalAdj,
    teamTwoY,
    iconSize,
    iconSize
  )

  svg
    .text(teamTwoX + horizontalAdj, teamTwoY + yOffset, participantsInfo[13])
    .attr({
      fill: playerColour['Player7'],
    })

  svg
    .rect(
      teamTwoX - borderOffset + horizontalAdj,
      teamTwoY - borderOffset,
      borderSize,
      borderSize
    )
    .attr({
      fill: 'none',
      stroke: playerColour['Player7'],
      'stroke-width': '5',
      opacity: 0.7,
    })

  let iconEight = svg.image(
    playerImg[7],
    teamTwoX,
    teamTwoY + verticalAdj,
    iconSize,
    iconSize
  )

  svg
    .text(teamTwoX - 10, teamTwoY + verticalAdj + yOffset, participantsInfo[15])
    .attr({
      fill: playerColour['Player8'],
    })

  svg
    .rect(
      teamTwoX - borderOffset,
      teamTwoY - borderOffset + verticalAdj,
      borderSize,
      borderSize
    )
    .attr({
      fill: 'none',
      stroke: playerColour['Player8'],
      'stroke-width': '5',
      opacity: 0.7,
    })

  let iconNine = svg.image(
    playerImg[8],
    teamTwoX + horizontalAdj,
    teamTwoY + verticalAdj,
    iconSize,
    iconSize
  )

  svg
    .text(
      teamTwoX + horizontalAdj,
      teamTwoY + verticalAdj + yOffset,
      participantsInfo[17]
    )
    .attr({
      fill: playerColour['Player9'],
    })

  svg
    .rect(
      teamTwoX - borderOffset + horizontalAdj,
      teamTwoY - borderOffset + verticalAdj,
      borderSize,
      borderSize
    )
    .attr({
      fill: 'none',
      stroke: playerColour['Player9'],
      'stroke-width': '5',
      opacity: 0.7,
    })

  let iconTen = svg.image(
    playerImg[9],
    teamTwoX,
    teamTwoY + verticalAdj * 2,
    iconSize,
    iconSize
  )

  svg
    .text(
      teamTwoX - 10,
      teamTwoY + verticalAdj * 2 + yOffset,
      participantsInfo[19]
    )
    .attr({
      fill: playerColour['Player10'],
    })

  svg
    .rect(
      teamTwoX - borderOffset,
      teamTwoY - borderOffset + verticalAdj * 2,
      borderSize,
      borderSize
    )
    .attr({
      fill: 'none',
      stroke: playerColour['Player10'],
      'stroke-width': '5',
      opacity: 0.7,
    })

  const mapSize = 128
  const mapX = 23
  const mapY = 520

  svg.text(mapX + 15, mapY - 25, 'Map Division')

  if (useMode === 0 || useMode == 1) {
    svg.image('../../src/image/MiniMapSimple.png', mapX, mapY, mapSize, mapSize)
  } else {
    svg.image(
      '../../src/image/MiniMapComplex.png',
      mapX,
      mapY,
      mapSize,
      mapSize
    )
  }
}

// Draw timeline
function timeline() {
  sections = totalTimestamp / 180000 // 3 mins interval
  console.log(sections)
  let accumTimestamp = totalTimestamp / sections
  let timeAidedLine
  const distance =
    (width /
      (timeReturn(totalTimestamp)[0] * 60 + timeReturn(totalTimestamp)[1])) *
    180
  console.log(distance)
  let posX

  for (let segments = 0; segments < sections; segments++) {
    // draw vertical lines
    posX = xOrigin + distance * segments
    console.log(posX)
    timeAidedLine = svg.line(posX, yOrigin, posX, 1160)
    timeAidedLine.attr({
      fill: 'none',
      stroke: 'black',
      'stroke-dasharray': '4',
    })

    // write labels
    let txt = svg.text(
      70 + distance * segments + 95 + 70 + 100,
      1120 + 20 + 60,
      timeStamp(accumTimestamp * segments)
    ) // we need a loop to draw all lines#
    txt.attr({
      'font-size': 30,
    })
  }
}

function timeStamp(perTimestamp) {
  let perMin = Math.floor((perTimestamp / 1000 / 60) << 0)
  return perMin + 'Min'
}

function timeReturn(perTimestamp) {
  let perMin = Math.floor((perTimestamp / 1000 / 60) << 0),
    perSec = Math.floor((perTimestamp / 1000) % 60)

  // perMin + ':' + perSec

  return [perMin, perSec]
}

// need to change the order of reading the pictures if reversing the location labels
function locationBox(locationSet, useMode) {
  console.log(locationSet)

  let lineHeight = height / locationSet.length

  let stripe = svg.image('../../src/image/stripe.svg', 0, 0, 5920, lineHeight)

  let pat = stripe.pattern(0, 0, 5920, lineHeight)

  // Initialise Rectangles

  let rect = []
  let length = locationSet.length

  // console.log('LEN: ' + length)

  for (let i = 0; i < length; i++) {
    rect[i] = []
  }

  // console.log(rect)

  const textXPosOne = 210
  const textXPosTwo = 6380

  let localHeight = 0

  let mask
  let img

  for (let i = 0; i < length; i++) {
    localHeight = localHeight + lineHeight

    if ((i + 1) % 2 !== 0) {
      rect[i] = svg
        .rect(xOrigin, lineHeight * i + yOrigin, width, lineHeight)
        .attr({
          fill: 'rgba(128, 128, 128, 0.5)',
          fillOpacity: '0.1',
          stroke: 'none',
        })
      // console.log('y Value: ' + (lineHeight * (i + 1)) / 2 + yOrigin)
      svg
        .text(
          textXPosOne,
          localHeight + yOrigin - lineHeight / 2,
          locationSet[i]
        )
        .attr({ 'font-size': 17 })
        .hover(
          event => {
            pt.x = event.clientX
            pt.y = event.clientY

            pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

            const tipWindowSize = 200
            const maskSize = 200

            let tipX = pt.x
            let tipY = pt.y

            if (i > 4) {
              tipX -= 100
              tipY -= 100
            }

            mask = svg
              .rect(tipX, tipY, maskSize, maskSize, 10, 10)
              .attr({ fill: 'yellow' })
            // draw for complex and simple version
            if (useMode === 0) {
              img = svg.image(
                `../../src/image/sessionImgsSimple/${i + 1}.png`,
                tipX,
                tipY,
                tipWindowSize,
                tipWindowSize
              )
              // console.log(`../../src/image/sessionImgsSimple/${i + 1}.png`)
            } else if (useMode === 1) {
              img = svg.image(
                `../../src/image/sessionImgsSimpleSpecial/${i + 1}.png`,
                tipX,
                tipY,
                tipWindowSize,
                tipWindowSize
              )
            } else {
              img = svg.image(
                `../../src/image/MiniMaps/${i + 1}.png`,
                tipX,
                tipY,
                tipWindowSize,
                tipWindowSize
              )
            }
            img.attr({
              mask: mask,
            })
          },
          () => {
            mask.remove()
            img.remove()
          }
        )
      svg
        .text(
          textXPosTwo,
          localHeight + yOrigin - lineHeight / 2,
          locationSet[i]
        )
        .attr({ 'font-size': 17 })
        .hover(
          event => {
            pt.x = event.clientX
            pt.y = event.clientY

            pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

            const tipWindowSize = 200
            const maskSize = 200

            let tipX = pt.x
            let tipY = pt.y

            tipX -= 200

            if (i > 4) {
              // tipX -= 100
              tipY -= 100
            }

            mask = svg
              .rect(tipX, tipY, maskSize, maskSize, 10, 10)
              .attr({ fill: 'yellow' })
            // draw for complex and simple version
            if (useMode === 0) {
              img = svg.image(
                `../../src/image/sessionImgsSimple/${i + 1}.png`,
                tipX,
                tipY,
                tipWindowSize,
                tipWindowSize
              )
              // console.log(`../../src/image/sessionImgsSimple/${i + 1}.png`)
            } else if (useMode === 1) {
              img = svg.image(
                `../../src/image/sessionImgsSimpleSpecial/${i + 1}.png`,
                tipX,
                tipY,
                tipWindowSize,
                tipWindowSize
              )
            } else {
              img = svg.image(
                `../../src/image/MiniMaps/${i + 1}.png`,
                tipX,
                tipY,
                tipWindowSize,
                tipWindowSize
              )
            }
            img.attr({
              mask: mask,
            })
          },
          () => {
            mask.remove()
            img.remove()
          }
        )
    }

    if ((i + 1) % 2 === 0) {
      rect[i] = svg
        .rect(xOrigin, lineHeight * i + yOrigin, width, lineHeight)
        .attr({
          fill: 'rgba(255, 255, 255, 0.1)',
          stroke: 'none',
        })
      // console.log('y Value: ' + lineHeight * i + yOrigin)
      svg
        .text(
          textXPosOne,
          localHeight + yOrigin - lineHeight / 2,
          locationSet[i]
        )
        .attr({ 'font-size': 17 })
        .hover(
          event => {
            pt.x = event.clientX
            pt.y = event.clientY

            pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

            const tipWindowSize = 200
            const maskSize = 200

            let tipX = pt.x
            let tipY = pt.y

            if (i > 4) {
              // tipX -= 100
              tipY -= 100
            }

            mask = svg
              .rect(tipX, tipY, maskSize, maskSize, 10, 10)
              .attr({ fill: 'yellow' })
            // draw for complex and simple version
            if (useMode === 0) {
              img = svg.image(
                `../../src/image/sessionImgsSimple/${i + 1}.png`,
                tipX,
                tipY,
                tipWindowSize,
                tipWindowSize
              )
            } else if (useMode === 1) {
              img = svg.image(
                `../../src/image/sessionImgsSimpleSpecial/${i + 1}.png`,
                tipX,
                tipY,
                tipWindowSize,
                tipWindowSize
              )
            } else {
              img = svg.image(
                `../../src/image/MiniMaps/${i + 1}.png`,
                tipX,
                tipY,
                tipWindowSize,
                tipWindowSize
              )
            }
            img.attr({
              mask: mask,
            })
          },
          () => {
            mask.remove()
            img.remove()
          }
        )

      svg
        .text(
          textXPosTwo,
          localHeight + yOrigin - lineHeight / 2,
          locationSet[i]
        )
        .attr({ 'font-size': 17 })
        .hover(
          event => {
            pt.x = event.clientX
            pt.y = event.clientY

            pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

            const tipWindowSize = 200
            const maskSize = 200

            let tipX = pt.x
            let tipY = pt.y

            tipX -= 200

            if (i > 4) {
              // tipX -= 100
              tipY -= 100
            }

            mask = svg
              .rect(tipX, tipY, maskSize, maskSize, 10, 10)
              .attr({ fill: 'yellow' })
            // draw for complex and simple version
            if (useMode === 0) {
              img = svg.image(
                `../../src/image/sessionImgsSimple/${i + 1}.png`,
                tipX,
                tipY,
                tipWindowSize,
                tipWindowSize
              )
            } else if (useMode === 1) {
              img = svg.image(
                `../../src/image/sessionImgsSimpleSpecial/${i + 1}.png`,
                tipX,
                tipY,
                tipWindowSize,
                tipWindowSize
              )
            } else {
              img = svg.image(
                `../../src/image/MiniMaps/${i + 1}.png`,
                tipX,
                tipY,
                tipWindowSize,
                tipWindowSize
              )
            }
            img.attr({
              mask: mask,
            })
          },
          () => {
            mask.remove()
            img.remove()
          }
        )
    }
  }

  let border

  let text

  for (let i = 0; i < length; i++) {
    rect[i].mousedown(() => {
      // console.log(rect[i])

      pt.x = event.clientX
      pt.y = event.clientY
      pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

      const mapSize = 200

      let tipX = pt.x
      let tipY = pt.y

      if (pt.y >= 800) {
        tipY -= 280
      }

      border = svg.rect(tipX, tipY, 250, 280, 10, 10).attr({
        stroke: 'black',
        fill: 'rgba(255,255,255, 0.9)',
        strokeWidth: '3px',
      })

      mask = svg
        .rect(tipX + 25, tipY + 50, mapSize, mapSize, 10, 10)
        .attr({ fill: 'rgba(225, 225, 0)' })
      if (useMode === 0) {
        ;[]
        img = svg.image(
          `../../src/image/sessionImgsSimple/${i + 1}.png`,
          tipX + 25,
          tipY + 50,
          mapSize,
          mapSize
        )
      } else if (useMode === 1) {
        img = svg.image(
          `../../src/image/sessionImgsSimpleSpecial/${i + 1}.png`,
          tipX + 25,
          tipY + 50,
          mapSize,
          mapSize
        )
      } else {
        img = svg.image(
          `../../src/image/MiniMaps/${i + 1}.png`,
          tipX + 25,
          tipY + 50,
          mapSize,
          mapSize
        )
      }

      img.attr({
        mask: mask,
      })

      text = svg
        .text(tipX + 28, tipY + 35, locationSet[i])
        .attr('pointer-events', 'none')
        .attr({ 'font-size': 20 })
    })
    rect[i].drag(() => {
      console.log('REMOVE')
      border.remove()
      img.remove()
      mask.remove()
      text.remove()
      event.preventDefault()
    })
    rect[i].mouseup(() => {
      console.log('REMOVE')
      border.remove()
      img.remove()
      mask.remove()
      text.remove()
      event.preventDefault()
    })
  }
}

let lastEventTime = null

async function drawEvents(graph, participantsInfo, nexusKiller, nexusKillerId) {
  await jsonReadTwo.then(function(result) {
    const data = result
    let lastTimestamp = null
    for (let i in data) {
      let posX = data[i]['position']['x']
      let posY = data[i]['position']['y']
      let killerName = data[i]['killerName']
      let victimName = data[i]['victimName']

      let border, mask, img

      let killer, victim

      let killerIcon, victimIcon

      let killing

      if (data[i]['killType'] === 'CHAMPION_KILL') {
        const iconSize = 30
        const offset = iconSize / 2

        let playerIndex = data[i]['victimID']
        let currentTimestamp = data[i]['timestamp']
        let currentPlayer = 'Player' + String(playerIndex)

        let deathPosX = graph.getCharacterX(currentPlayer, currentTimestamp)
        let deathPosY = graph.getCharacterY(currentPlayer, currentTimestamp)

        // Player Icon
        let indexHolder = currentPlayer.match(/\d/g)
        indexHolder = indexHolder.join('')
        // console.log('CP: ' + (parseInt(indexHolder) - 1))

        svg
          .image(
            `../../src/image/Skulls/${currentPlayer}.png`,
            deathPosX - offset,
            deathPosY - offset,
            iconSize,
            iconSize
          )
          .hover(
            event => {
              pt.x = event.clientX
              pt.y = event.clientY

              pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

              const mapSize = 200

              let tipX = pt.x
              let tipY = pt.y

              console.log(tipX, tipY)

              if (pt.y >= 850) {
                // tipX -= 100
                tipY -= 100
              }

              if (pt.y >= 950) {
                // tipX -= 100
                tipY -= 200
              }

              if (pt.x >= 5700) {
                tipX -= 200
              }

              // console.log(posX, posY)
              // console.log(timeStamp(currentTimestamp))

              let xOffset = (posX / 15000) * 200
              let yOffset = 200 - (posY / 15000) * 200

              border = svg.rect(tipX, tipY, 250, 300, 10, 10).attr({
                stroke: playerColour[currentPlayer],
                fill: 'rgba(255,255,255, 0.9)',
                strokeWidth: '3px',
              })

              killer = svg.text(35 + tipX, 25 + tipY, 'KILLER: ')
              victim = svg.text(130 + tipX, 25 + tipY, 'VICTIM: ')

              killerIcon = svg.image(
                `../../src/image/Champions/${killerName}Square.png`,
                35 + tipX,
                35 + tipY,
                40,
                40
              )
              victimIcon = svg.image(
                `../../src/image/Champions/${victimName}Square.png`,
                130 + tipX,
                35 + tipY,
                40,
                40
              )

              mask = svg
                .rect(tipX + 25, tipY + 90, mapSize, mapSize, 10, 10)
                .attr({ fill: 'rgba(225, 225, 0)' })
              img = svg.image(
                `../../src/image/MiniMap.png`,
                tipX + 25,
                tipY + 90,
                mapSize,
                mapSize
              )
              img.attr({
                mask: mask,
              })
              killing = svg
                .circle(tipX + 25 + xOffset, tipY + 90 + yOffset, 5)
                .attr({ fill: 'none', stroke: 'white', strokeWidth: '3px' })
              // console.log(currentTimestamp, currentPlayer)
            },
            () => {
              border.remove()
              killer.remove()
              killerIcon.remove()
              victim.remove()
              victimIcon.remove()
              mask.remove()
              img.remove()
              killing.remove()
            }
          )
      }

      building: if (data[i]['killType'] === 'BUILDING_KILL') {
        const iconSize = 35
        const offset = iconSize / 2
        let playerIndex = data[i]['killerId']
        let currentTimestamp = data[i]['timestamp']
        let buildingType = data[i]['towerType']

        if (data[i]['towerType'] == undefined) {
          buildingType = data[i]['buildingType']
        }

        let resultType = buildingType.replace('_', ' ')

        let currentPlayer = 'Player' + String(playerIndex)

        if (playerIndex === 0) {
          break building
        } // We need to ignore the case 0, later on we should ignore it when we collect the data
        // turret destroyed => 0 means it either self-destructed (azir tower) or minions got it

        // console.log('BUILDING KILLER: ' + currentPlayer)
        let iconPosX = graph.getCharacterX(currentPlayer, currentTimestamp)
        let iconPosY = graph.getCharacterY(currentPlayer, currentTimestamp)
        // console.log(currentPlayer, posX, posY)

        let mask, img

        svg
          .image(
            `../../src/image/Turrets/${currentPlayer}.png`,
            iconPosX - offset,
            iconPosY - offset,
            iconSize,
            iconSize
          )
          .hover(
            event => {
              pt.x = event.clientX
              pt.y = event.clientY

              pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

              const mapSize = 200

              let tipX = pt.x
              let tipY = pt.y

              if (pt.y >= 995) {
                tipX -= 50
                tipY -= 250
              }

              if (pt.x >= 5700) {
                tipX -= 200
              }

              let xOffset = (posX / 15000) * 200
              let yOffset = 200 - (posY / 15000) * 200

              border = svg.rect(tipX, tipY, 250, 300, 10, 10).attr({
                stroke: 'black',
                fill: 'rgba(255,255,255, 0.9)',
                strokeWidth: '3px',
              })

              killer = svg.text(35 + tipX, 25 + tipY, 'KILLER: ')
              victim = svg.text(80 + tipX, 62 + tipY, resultType)

              killerName =
                participantsInfo[participantsInfo.indexOf(playerIndex) + 1]

              killerIcon = svg.image(
                `../../src/image/Champions/${killerName}Square.png`,
                35 + tipX,
                35 + tipY,
                40,
                40
              )

              mask = svg
                .rect(tipX + 25, tipY + 90, mapSize, mapSize, 10, 10)
                .attr({ fill: 'rgba(225, 225, 0)' })
              img = svg.image(
                `../../src/image/MiniMap.png`,
                tipX + 25,
                tipY + 90,
                mapSize,
                mapSize
              )
              img.attr({
                mask: mask,
              })
              killing = svg
                .circle(tipX + 25 + xOffset, tipY + 90 + yOffset, 5)
                .attr({ fill: 'none', stroke: 'white', strokeWidth: '3px' })
            },
            () => {
              border.remove()
              killer.remove()
              killerIcon.remove()
              victim.remove()
              mask.remove()
              img.remove()
              killing.remove()
            }
          )
      }

      lastTimestamp = data[i]['timestamp']
    }

    // draw the final nexus kill

    let border

    let killer, victim

    let killerIcon

    const iconSize = 35
    const offset = iconSize / 2

    let nexusKillPosX = graph.getCharacterX(nexusKiller, lastTimestamp)
    let nexusKillPosY = graph.getCharacterY(nexusKiller, lastTimestamp)

    svg
      .image(
        `../../src/image/Turrets/${nexusKiller}.png`,
        nexusKillPosX - offset,
        nexusKillPosY - offset,
        iconSize,
        iconSize
      )
      .hover(
        event => {
          pt.x = event.clientX
          pt.y = event.clientY

          pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

          let tipX = pt.x
          let tipY = pt.y

          if (pt.y >= 995) {
            tipX -= 50
            tipY -= 250
          }

          if (pt.x >= 5700) {
            tipX -= 200
          }

          border = svg.rect(tipX, tipY, 220, 120, 10, 10).attr({
            stroke: 'black',
            fill: 'rgba(255,255,255, 0.9)',
            strokeWidth: '3px',
          })

          killer = svg.text(35 + tipX, 25 + tipY, 'KILLER: ')
          victim = svg.text(35 + tipX, 62 + tipY + 45, 'Nexus Kill')

          let killerName =
            participantsInfo[participantsInfo.indexOf(nexusKillerId) + 1]

          killerIcon = svg.image(
            `../../src/image/Champions/${killerName}Square.png`,
            35 + tipX,
            35 + tipY,
            40,
            40
          )
        },
        () => {
          border.remove()
          killer.remove()
          killerIcon.remove()
          victim.remove()
        }
      )
  })
}

function drawDBSCAN(dbSCANData, graph) {
  let dbScanLabel = []

  for (let item in dbSCANData) {
    if (dbScanLabel.indexOf(dbSCANData[item]['label']) === -1) {
      dbScanLabel.push(dbSCANData[item]['label'])
    }
  }
  // console.log(dbScanLabel)

  for (let element in dbScanLabel) {
    let x, y
    let sumX = 0,
      sumY = 0
    let points = []

    for (let item in dbSCANData) {
      if (dbScanLabel[element] == dbSCANData[item]['label']) {
        x = graph.getCharacterX(
          dbSCANData[item]['player'],
          dbSCANData[item]['timestamp']
        )
        y = graph.getCharacterY(
          dbSCANData[item]['player'],
          dbSCANData[item]['timestamp']
        )

        sumX = sumX + x
        sumY = sumY + y

        points.push([x, y])
      }
    }

    shapeCovering(points)
  }
}

// function main2() {
//   const iStoryliner = new iStoryline()
//   // Scale to window size
//   const containerDom = document.getElementById('mySvg')
//   const windowW = containerDom.clientWidth - 20
//   const windowH = containerDom.clientHeight - 20
//   iStoryliner.addCharacter('tt', [[0, 10], [50, 60]])
//   graph = iStoryliner.scale(10, 10, windowW * 0.8, windowH / 2)
//   logStoryInfo(iStorylineInstance._story)
//   const storylines = graph.storylines
//   storylines.forEach(storyline => drawStoryline(storyline))
// }

// main2()
