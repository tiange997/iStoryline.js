import Snap from 'snapsvg'
import $ from 'jquery'
import * as path from 'path'

let playerInfo

// An array to store characters' name and starting point
let namePosition = []

// For tips

let border //, mask, img

let name //zone

let heroIcon

// For SVG selection

const svg = Snap('#mySvg')

let mySvg = $('#mySvg')[0]

let pt = mySvg.createSVGPoint()

let playerColour = {
  Player1: '#5B7DB1',
  Player2: '#00B8D1',
  Player3: '#00B827',
  Player4: '#5BB58A',
  Player5: '#9B8BD6',
  Player6: '#ff4e00',
  Player7: '#ff5c8a',
  Player8: '#f5bb00',
  Player9: '#ec9f05',
  Player10: '#bf3100',
}

export function drawSegmentPath(
  pathStr,
  defaultWidth = 2,
  hoverWidth = 4,
  character
) {
  const pathSvg = svg.path(pathStr)

  let color = 'black'
  // let svgText = svg.text(10, 10, "Test")

  // console.log(positionInfo)

  // console.log('Received: ' + playerInfo)

  switch (character) {
    case 'Player2':
      color = '#00B8D1'
      pathSvg.attr({
        'stroke-dasharray': '4',
        opacity: 0.7,
      })
      break
    case 'Player3':
      color = '#00B827'
      pathSvg.attr({
        'stroke-dasharray': '4',
        opacity: 0.7,
      })
      break
    case 'Player4':
      color = '#5BB58A'
      pathSvg.attr({
        'stroke-dasharray': '4',
        opacity: 0.7,
      })
      break
    case 'Player5':
      color = '#9B8BD6'
      pathSvg.attr({
        'stroke-dasharray': '4',
        opacity: 0.7,
      })
      break
    case 'Player6':
      color = '#ff4e00'
      pathSvg.attr({ opacity: 0.7 })
      break
    case 'Player7':
      color = '#ff5c8a'
      pathSvg.attr({ opacity: 0.7 })
      break
    case 'Player8':
      color = '#f5bb00'
      pathSvg.attr({ opacity: 0.7 })
      break
    case 'Player9':
      color = '#ec9f05'
      pathSvg.attr({ opacity: 0.7 })
      break
    case 'Player10':
      color = '#bf3100'
      pathSvg.attr({ opacity: 0.7 })
      break
    default:
      color = '#5B7DB1'
      pathSvg.attr({
        'stroke-dasharray': '4',
        opacity: 0.7,
      })
  }

  pathSvg.hover(
    () => {
      pathSvg.attr({
        'stroke-width': 8,
      })
    },
    () => {
      pathSvg.attr({
        'stroke-width': 4,
      })
    }
  )

  pathSvg.attr({
    fill: 'none',
    stroke: color,
    // 'stroke-width': defaultWidth
    'stroke-width': 4,
  })

  return pathSvg
}

export function drawStorylinePath(storylinePath) {
  storylinePath.forEach(segmentPath => drawSegmentPath(segmentPath))
}

// let redCap = false
// let mother = false
// let grandmother = false
// let wolf = false

// make sure we only get the starting point once in the iteration
let Player1 = false
let Player2 = false
let Player3 = false
let Player4 = false
let Player5 = false
let Player6 = false
let Player7 = false
let Player8 = false
let Player9 = false
let Player10 = false

let printOnce = false

let pointOneXPos, pointOneYPos, pointTwoXPos, pointTwoYPos

export function drawStoryline(
  character,
  storyline,
  session,
  locationSet,
  perTimestamp,
  participantsInfo,
  pathList,
  type = 'simple'
) {
  // console.log(positionInfo)

  // console.log(participantsInfo)

  if (!printOnce && session && locationSet) {
    console.log('Session passed in!')
    console.log('Location info passed in!')
    console.log(perTimestamp)
    printOnce = true
  }

  storyline.forEach((segment, idx) => {
    // console.log(character)
    // console.log(segment)

    switch (character) {
      case 'Player2':
        if (!Player2) {
          Player2 = true
          namePosition.push(character, segment[0][0], segment[0][1]) // character's name followed by the x,y coordinates of the starting point
          // console.log("Player2 caught!")
          // console.log(character, segment[0][0], segment[0][1])
        }
        break
      case 'Player3':
        if (!Player3) {
          Player3 = true
          namePosition.push(character, segment[0][0], segment[0][1])
        }
        break
      case 'Player4':
        if (!Player4) {
          Player4 = true
          namePosition.push(character, segment[0][0], segment[0][1])
        }
        break
      case 'Player5':
        if (!Player5) {
          Player5 = true
          namePosition.push(character, segment[0][0], segment[0][1])
        }
        break
      case 'Player6':
        if (!Player6) {
          Player6 = true
          namePosition.push(character, segment[0][0], segment[0][1])
        }
        break
      case 'Player7':
        if (!Player7) {
          Player7 = true
          namePosition.push(character, segment[0][0], segment[0][1])
        }
        break
      case 'Player8':
        if (!Player8) {
          Player8 = true
          namePosition.push(character, segment[0][0], segment[0][1])
        }
        break
      case 'Player9':
        if (!Player9) {
          Player9 = true
          namePosition.push(character, segment[0][0], segment[0][1])
        }
        break
      case 'Player10':
        if (!Player10) {
          Player10 = true
          namePosition.push(character, segment[0][0], segment[0][1])
          pointTwoXPos = parseInt(segment[0][0])
          pointTwoYPos = parseInt(segment[0][1])
          // console.log('printed: ' + pointTwoXPos, pointTwoYPos)
        }
        break
      default:
        if (!Player1) {
          Player1 = true
          namePosition.push(character, segment[0][0], segment[0][1])
          pointOneXPos = segment[0][0]
          pointOneYPos = segment[0][1]
          // console.log('get first point:' + pointOneXPos, pointOneYPos)
          // console.log(segment)
        }
    }

    let segmentPath = ''
    switch (type) {
      case 'bezier':
        segmentPath = generateBezierPath(segment)
        break
      default:
        segmentPath = generateSimplePath(segment)
        break
    }

    playerInfo = participantsInfo

    const segmentPathSvg = drawSegmentPath(
      segmentPath,
      2,
      4,
      character,
      namePosition,
      perTimestamp
    ) // To pass the character info, participants info as well as the generated array

    /*    segmentPathSvg.click(() => {
      console.log(namePosition)
      console.log(segmentPath)

      // Find out character's name in nameposition array
      // let i = namePosition.indexOf(character)
      // let startingPoint = [namePosition[i+1], namePosition[i+2]]
      // console.log(startingPoint)

      let idNumber = character.match(/\d/g)
      idNumber = idNumber.join('')
      console.log(parseInt(idNumber))
      console.log(character, idx, session[parseInt(idNumber) - 1][idx]) // parseInt(idNumber)-1][idx] has undefined element when it was 14, this needs to minus 1

      // console.log(locationSet)

      let accessIndex = session[parseInt(idNumber) - 1][idx] - 1
      console.log(locationSet[accessIndex])
      idNumber = ''
      console.log(character, idx) // parseInt(idNumber)-1][idx] has undefined element when it was 14, this needs to minus 1
    })*/

    segmentPathSvg.hover(
      event => {
        pt.x = event.clientX
        pt.y = event.clientY

        // console.log(event.clientX, event.clientY)

        pt = pt.matrixTransform(mySvg.getScreenCTM().inverse())

        // console.log(pt.x, pt.y)

        let idNumber = character.match(/\d/g)
        idNumber = parseInt(idNumber.join(''))
        // console.log(idNumber, playerInfo[idNumber * 2 - 1])

        let placeIndex = session[parseInt(idNumber) - 1][idx]
        // console.log(placeIndex)

        let accessIndex = session[parseInt(idNumber) - 1][idx] - 1

        const mapSize = 200
        const maskSize = 200
        let tipX = pt.x
        let tipY = pt.y

        // console.log(playerInfo)

        if (pt.y > 220 && pt.y < 995) {
          tipX -= 100
          tipY -= 100
          drawLineTip(
            tipX,
            tipY,
            mapSize,
            maskSize,
            playerInfo,
            idNumber,
            locationSet,
            accessIndex,
            placeIndex
          )
        } else if (pt.y >= 995) {
          tipX -= 100
          tipY -= 400
          drawLineTip(
            tipX,
            tipY,
            mapSize,
            maskSize,
            playerInfo,
            idNumber,
            locationSet,
            accessIndex,
            placeIndex
          )
        } else {
          tipX -= 100
          tipY += 50
          drawLineTip(
            tipX,
            tipY,
            mapSize,
            maskSize,
            playerInfo,
            idNumber,
            locationSet,
            accessIndex,
            placeIndex
          )
        }
      },
      () => {
        removeTips()
      }
    )
  })
}

function drawLineTip(
  tipX,
  tipY,
  mapSize,
  maskSize,
  playerInfo,
  idNumber,
  locationSet,
  accessIndex,
  placeIndex
) {
  let playerName = playerInfo[idNumber * 2 - 1]
  // console.log(playerInfo)

  if (pt.x >= 5700) {
    tipX -= 200
  }

  border = svg.rect(tipX, tipY, 220, 80, 10, 10).attr({
    stroke: playerColour[`Player${idNumber}`],
    fill: 'rgba(255,255,255, 0.9)',
    strokeWidth: '3px',
  })

  heroIcon = svg.image(
    `../../src/image/Champions/${playerName}Square.png`,
    30 + tipX,
    20 + tipY,
    50,
    50
  )

  name = svg.text(90 + tipX, 45 + tipY, playerName)

  // zone = svg.text(90 + tipX, 45 + tipY, locationSet[accessIndex])

  /*  mask = svg
    .rect(tipX + 25, tipY + 90, maskSize, maskSize, 10, 10)
    .attr({ fill: 'rgba(225, 225, 0)' })
  img = svg.image(
    `../../src/image/MiniMaps/${placeIndex}.png`,
    tipX + 25,
    tipY + 90,
    mapSize,
    mapSize
  )
  img.attr({
    mask: mask,
  })*/
}

function removeTips() {
  border.remove()
  heroIcon.remove()
  name.remove()
  // zone.remove()
  // mask.remove()
  // img.remove()
}

function generateSimplePath(points) {
  if (points.length === 0) return ''
  let pathStr = `M ${points[0][0]} ${points[0][1]}`
  for (let i = 1, len = points.length; i < len; i++) {
    pathStr += `L ${points[i][0]} ${points[i][1]}`
  }
  return pathStr
}

function generateBezierPath(points) {
  if (points.length < 4) return generateSimplePath(points)
  const pointsNum = points.length
  let i = 0
  let pathStr = `M ${points[i][0]} ${points[i][1]} C ${points[i + 1][0]} ${
    points[i + 1][1]
  } ${points[i + 2][0]} ${points[i + 2][1]} ${points[i + 3][0]} ${
    points[i + 3][1]
  }`
  for (i = 4; i < pointsNum - 2; i += 2) {
    pathStr += `S ${points[i][0]} ${points[i][1]} ${points[i + 1][0]} ${
      points[i + 1][1]
    }`
  }
  pathStr += ` L ${points[pointsNum - 1][0]} ${points[pointsNum - 1][1]}`
  return pathStr
}

function timeStamp(perTimestamp) {
  let perMin = Math.floor((perTimestamp / 1000 / 60) << 0),
    perSec = Math.floor((perTimestamp / 1000) % 60)

  let log = perMin + ':' + perSec
  return log
}
