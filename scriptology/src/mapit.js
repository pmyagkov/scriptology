﻿#target photoshop
#include common.js

var sheetFilePath = '~/Projects/allmyart/scriptology/src/config/visuarea_dimensions.csv'
var logoFilePath = '~/Projects/allmyart/scriptology/logo+site.tif'

var OUTER_FRAME_SIZE = 3 // cm
// var INNER_FRAME_SIZE = 3.5 // cm
var LINE_SIDE_MARGIN = 8.7 // cm
var DOTS_SIDE_MARGIN = 0.5 // cm
var DOT_RADIUS = 4 // px

var OUTER_FRAME_LAYER_NAME = 'all black'
var INNER_FRAME_LAYER_NAME = 'all princess'
var LINES_DOTS_LAYER_NAME = 'lines & dots'

var COLORS = {}
function initColors () {
  var whiteColor = new SolidColor()
  whiteColor.cmyk.cyan = 0
  whiteColor.cmyk.magenta = 0
  whiteColor.cmyk.yellow = 0
  whiteColor.cmyk.black = 0

  COLORS['white'] = whiteColor

  var blackColor = new SolidColor()
  blackColor.cmyk.cyan = 75
  blackColor.cmyk.magenta = 68
  blackColor.cmyk.yellow = 67
  blackColor.cmyk.black = 90

  COLORS['black'] = blackColor

  var princess1Color = new SolidColor()
  princess1Color.cmyk.cyan = 55
  princess1Color.cmyk.magenta = 1
  princess1Color.cmyk.yellow = 1
  princess1Color.cmyk.black = 1

  var princess2Color = new SolidColor()
  princess2Color.cmyk.cyan = 20
  princess2Color.cmyk.magenta = 66
  princess2Color.cmyk.yellow = 1
  princess2Color.cmyk.black = 1

  var princess3Color = new SolidColor()
  princess3Color.cmyk.cyan = 1
  princess3Color.cmyk.magenta = 14
  princess3Color.cmyk.yellow = 88
  princess3Color.cmyk.black = 1

  COLORS['princess'] = [princess1Color, princess2Color, princess3Color]
}

function pictureInfoGotten (pictureDefinition, size) {
  createModulesFrames(pictureDefinition, size)
  insertLogo()
}

function drawBorder (bounds, size, color, opacity) {
  _select([
    [bounds.left.as('px'), bounds.top.as('px')],
    [bounds.left.as('px'), bounds.bottom.as('px')],
    [bounds.right.as('px'), bounds.bottom.as('px')],
    [bounds.right.as('px'), bounds.top.as('px')],
  ])

  activeDocument.selection.fill(color, ColorBlendMode.COLOR, opacity)

  var borderSizeCm = new UnitValue(size, 'cm')

  _select([
    [(bounds.left + borderSizeCm).as('px'), (bounds.top + borderSizeCm).as('px')],
    [(bounds.left + borderSizeCm).as('px'), (bounds.bottom - borderSizeCm).as('px')],
    [(bounds.right - borderSizeCm).as('px'), (bounds.bottom - borderSizeCm).as('px')],
    [(bounds.right - borderSizeCm).as('px'), (bounds.top + borderSizeCm).as('px')],
  ])

  _deleteArea()
  _deselect()
}


function drawFramesInDocument (frameDocument, innerFrameSize) {
  var blackBounds = {
    left: new UnitValue(0, 'cm'),
    top: new UnitValue(0, 'cm'),
    right: frameDocument.width,
    bottom: frameDocument.height,
  }

  var blackLayer = frameDocument.artLayers.add()
  blackLayer.name = OUTER_FRAME_LAYER_NAME

  drawBorder(blackBounds, OUTER_FRAME_SIZE, COLORS['black'], 100)

  var princessLayer = frameDocument.artLayers.add()
  princessLayer.name = INNER_FRAME_LAYER_NAME

  var princessBounds = {
    left: blackBounds.left + OUTER_FRAME_SIZE,
    top: blackBounds.top + OUTER_FRAME_SIZE,
    right: blackBounds.right - OUTER_FRAME_SIZE,
    bottom: blackBounds.bottom - OUTER_FRAME_SIZE,
  }

  var princessColor = COLORS['princess'][Math.floor(Math.random() * COLORS['princess'].length)]
  drawBorder(princessBounds, innerFrameSize, princessColor, 40)

  drawCornerLines(frameDocument)

  drawDots(frameDocument)
}

function drawCornerLines (frameDocument) {
  var linesLayer = frameDocument.artLayers.add()
  linesLayer.name = LINES_DOTS_LAYER_NAME

  var blackBounds = {
    left: new UnitValue(0, 'cm'),
    top: new UnitValue(0, 'cm'),
    right: frameDocument.width,
    bottom: frameDocument.height,
  }

  app.foregroundColor = COLORS['white']

  var strokeWidth = new UnitValue(2, 'px')

  // top-left
  _drawLine([
      (blackBounds.left + LINE_SIDE_MARGIN).as('px'),
      (blackBounds.top).as('px')
    ], [
      (blackBounds.left).as('px'),
      (blackBounds.top + LINE_SIDE_MARGIN).as('px')
    ],
    strokeWidth
  )

  // top-right
  _drawLine([
      (blackBounds.right - LINE_SIDE_MARGIN).as('px'),
      (blackBounds.top).as('px')
    ], [
      (blackBounds.right).as('px'),
      (blackBounds.top + LINE_SIDE_MARGIN).as('px')
    ],
    strokeWidth
  )

  // bottom-right
  _drawLine([
      (blackBounds.right - LINE_SIDE_MARGIN).as('px'),
      (blackBounds.bottom).as('px')
    ], [
      (blackBounds.right).as('px'),
      (blackBounds.bottom - LINE_SIDE_MARGIN).as('px')
    ],
    strokeWidth
  )

  // bottom-left
  _drawLine([
      (blackBounds.left + LINE_SIDE_MARGIN).as('px'),
      (blackBounds.bottom).as('px')
    ], [
      (blackBounds.left).as('px'),
      (blackBounds.bottom - LINE_SIDE_MARGIN).as('px')
    ],
    strokeWidth
  )
}

function drawDot (centerX, centerY) {
  _selectWithEllipse({
    left: new UnitValue(centerX - DOT_RADIUS, 'px'),
    top: new UnitValue(centerY - DOT_RADIUS, 'px'),
    right: new UnitValue(centerX + DOT_RADIUS, 'px'),
    bottom: new UnitValue(centerY + DOT_RADIUS, 'px'),
  })

  activeDocument.selection.fill(app.foregroundColor, ColorBlendMode.COLOR, 100)
  _deselect()
}

function drawDots (frameDocument) {
  var blackBounds = {
    left: new UnitValue(0, 'cm'),
    top: new UnitValue(0, 'cm'),
    right: frameDocument.width,
    bottom: frameDocument.height,
  }

  var verticalCenterY = blackBounds.bottom / 2
  var horizontalCenterY = blackBounds.right / 2

  var dotsSideMarginCm = new UnitValue(DOTS_SIDE_MARGIN, 'cm')

  var addition = new UnitValue(0, 'cm')
  var leftX = (blackBounds.left + dotsSideMarginCm).as('px')
  var rightX = (blackBounds.right - dotsSideMarginCm).as('px')
  while (verticalCenterY + addition < blackBounds.bottom) {
    drawDot(leftX, (verticalCenterY + addition).as('px'))
    drawDot(rightX, (verticalCenterY + addition).as('px'))
    if (addition.value !== 0) {
      drawDot(leftX, (verticalCenterY - addition).as('px'))
      drawDot(rightX, (verticalCenterY - addition).as('px'))
    }

    addition += 6
  }

  addition = new UnitValue(0, 'cm')
  var topY = (blackBounds.top + dotsSideMarginCm).as('px')
  var bottomY = (blackBounds.bottom - dotsSideMarginCm).as('px')
  while (horizontalCenterY + addition < blackBounds.right) {
    drawDot((horizontalCenterY + addition).as('px'), topY)
    drawDot((horizontalCenterY + addition).as('px'), bottomY)
    if (addition.value !== 0) {
      drawDot((horizontalCenterY - addition).as('px'), topY)
      drawDot((horizontalCenterY - addition).as('px'), bottomY)
    }

    addition += 6
  }
}

/**
 *
 * @param modulesDefinition
 * @param [modulesDefinition.name]
 * @param [modulesDefinition.modules] Array<Array<number, number>>
 */
function createModulesFrames (modulesDefinition, innerFrameSize) {
  var frames = modulesDefinition.modules
  var frame, frameName
  var resolution = 150
  var w, h;
  for (var i = 0; i < frames.length; i++) {
    frame = frames[i]
    frameName = modulesDefinition.name + '-' + i
    $.writeln('Creating frame ', frameName + ' ', frame[0] + 'cm' + ' ', frame[1] + 'cm')

    UnitValue.baseUnit = UnitValue (1 / resolution, 'in')

    w = new UnitValue(frame[0] + OUTER_FRAME_SIZE * 2 + innerFrameSize * 2, 'cm')
    h = new UnitValue(frame[1] + OUTER_FRAME_SIZE * 2 + innerFrameSize * 2, 'cm')
    var frameDocument = documents.add(
      w,                          // width
      h,                          // height
      resolution,                 // resolution
      frameName,                  // name
      NewDocumentMode.CMYK,       // mode
      DocumentFill.TRANSPARENT,   // initialFill
      1.0,                        // pixelAspectRatio
      BitsPerChannelType.SIXTEEN  // bitsPerChannel
    )

    drawFramesInDocument(frameDocument, innerFrameSize)
    insertModuleNumber(frameDocument, i + 1)

    return
  }
}

function insertModuleNumber (frameDocument, moduleNumber) {
  var layer = frameDocument.artLayers.add()
  layer.kind = LayerKind.TEXT
  layer.name = 'module number'
  layer.rotate(180)

  var textItem = layer.textItem
  textItem.contents = moduleNumber.toString()
  textItem.size = new UnitValue(40, 'pt')
  textItem.font = 'MuseoSansCyrl-300'
  textItem.justification = Justification.CENTER;
  textItem.kind = TextType.PARAGRAPHTEXT;
  textItem.color = COLORS['white']

  var layerBounds = _getLayerBounds(layer)
  layer.translate(
    frameDocument.width / 2 - layerBounds.left - layerBounds.width / 2,
    - layerBounds.top + new UnitValue(1.3, 'cm')
  )
}

function insertLogo () {
  var logoLayer = _placeImageOnNewLayer(logoFilePath)
  var logoLayerBounds = _getLayerBounds(logoLayer)

  // place the layer 1cm below the upper edge of bottom outer border side
  var deltaY = activeDocument.height
    - logoLayerBounds.bottom
    - OUTER_FRAME_SIZE
    + 1
    + logoLayerBounds.height

  _moveLayer(logoLayer, 0, deltaY.as('px'))
}

var config
function beginMagic () {
  initColors()
  config = _parseConfig()

  var prevRulerUnits, prevTypeUnits
  prevRulerUnits = app.preferences.rulerUnits
  prevTypeUnits = app.preferences.typeUnits
  app.preferences.rulerUnits = Units.CM
  app.preferences.typeUnits = TypeUnits.POINTS

  _showInfoDialog('', function (pictureDefinition, size) {
    try {
      pictureInfoGotten(pictureDefinition, size)
    } catch (e) {}

    app.preferences.rulerUnits = prevRulerUnits
    app.preferences.typeUnits = prevTypeUnits
  })

}

beginMagic()
