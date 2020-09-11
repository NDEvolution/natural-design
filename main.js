// Grid figure implementation
// ==========================

// sliders
const bs = ['#slider-definition', '#slider-intention']
bs.forEach((v, idx) => {
  $(v).empty().slider({
    min: 1,
    max: 5,
    value: 1,
    range: 'max',
    animate: true,
    orientation: 'vertical',
    slide: (event, ui) => {
      computeGridOrganizedData()
      gridFig.dispatchAction({
        type: 'dataZoom',
        dataZoomIndex: idx,
        start: (ui.value-1)*20,
      })
    },
  })
})
$('#slider-property').empty().slider({
  min: 1,
  max: 5,
  value: 1,
  range: 'max',
  animate: true,
  orientation: 'vertical',
  slide: (event, ui) => {
    computeGridOrganizedData()
    for (let i = 5; i > ui.value; i--) {
      gridFig.dispatchAction({
        type: 'legendSelect',
        name: i-1,
      })
    }
    for (let i = ui.value; i > 0; i--) {
      gridFig.dispatchAction({
        type: 'legendUnSelect',
        name: i-1,
      })
    }
  },
})

$('#slider-overall').empty().slider({
  min: 0,
  max: 100,
  value: 0,
  range: 'min',
  animate: true,
  orientation: 'vertical',
})
$('#slider-overall').find('.ui-slider-handle').hide();


// filters
let deactivatedFilters = []
const filters = {
  '#predefined-filters': ['Top-rated','Remaining'], //Origin of clusters
  '#keywords': ['NUI', 'Natural Interaction', 'Computation']
}
for (const [fid, filter] of Object.entries(filters)) {
  filter.forEach(v => {
    $(fid).append(
    $('<div/>', {
      'text': v,
      'class': 'button noselect',
      'style': `border: 2px solid #88b775;`
    }).hover(function() {
      if ($(this).hasClass('button-deactivate')) {
        $(this).css('background-color', '#b4b4b4')
        $(this).css('color', 'white')
      }
      else {
        $(this).css('color', 'white')
        $(this).css('background-color', '#88b775')
      }
    }).mouseout(function() {
      if ($(this).hasClass('button-deactivate')) {
        $(this).css('background-color', 'white')
        $(this).css('color', '#b4b4b4')
      }
      else {
        $(this).css('color', 'black')
        $(this).css('background-color', 'white')
      }
    }).click(function() {
      if ($(this).hasClass('button-deactivate')) {
        // from deactivate to activate
        $(this).removeClass('button-deactivate')
        $(this).css('background-color', '#88b775')
        $(this).css('border', `2px solid #88b775`)
        // remove from filter
        deactivatedFilters.splice(deactivatedFilters.indexOf(v), 1)
      } else {
        $(this).addClass('button-deactivate')
        $(this).css('background-color', '#b4b4b4')
        $(this).css('border', `2px solid #b4b4b4`)
        // add to filter
        deactivatedFilters.push(v)
      }
      gridFig.setOption(computeOption())
    })
    )
  })
}


const gridFig = echarts.init(document.getElementById('grid-fig'))
gridFig.setOption(computeOption())
gridFig.on('click', params => {
  if ($('#grid-reference').length > 0) {
    $('#grid-reference').remove()
  }
  if (params.data[2] !== undefined) {
    $('#grid').append($('<div/>', {
      id: 'grid-reference',
      class: 'reference',
    }))
    $('#grid-reference').append($(`<p>${references[params.data[2]].section}</p>`))
    return
  }
  // if nothing is selected, then delete!
  $('#grid-reference').remove()
})
// helpers
function computeOption() {
  return {
    legend: {
      show: false,
      data: ['1','2','3','4','5']
    },
    dataZoom: [{
      id: 'x',
      show: false,
    },{
      id: 'y',
      show: false,
      orient: 'vertical'
    }],
    xAxis: [
      {
        name: 'DEFINITION SCORE',
        nameLocation: 'middle',
        nameTextStyle: {
          fontSize: 20,
          lineHeight: 70,
          fontWeight: 'bolder',
        },
        axisLabel: { show: false},
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        show: true,
        type: 'value',
        min: 0.5,
        max: 5.5,
      },
    ],
    yAxis: [
      {
        name: 'INTENTION SCORE',
        nameLocation: 'middle',
        nameTextStyle: {
          fontSize: 20,
          lineHeight: 70,
          fontWeight: 'bolder',
        },
        axisLabel: { show: false},
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        show: true,
        type: 'value',
        min: 0.5,
        max: 5.5,
      },
    ],
    series: computeGridSeries(computeGrids()),
  }
}
function computeGrids() {
  const d = computeGridOrganizedData()
  const grids = []
  const score_color = [
    // ???
    // '#F7F8F8', // not selected area of slider
    // '#DDDEDD', // grey od grid
    '#E1EDDC', // 1
    '#C3DBBA', // 2
    '#88B775', // 3
    '#507C3E', // 4
    '#24351B', // 5
  ]
  for (let i = 0; i < 5; i++) {
    grids.push({
      name: `${i+1}`, // z
      symbolSize: 18,
      data: [
        // x, y
      ],
      type: 'scatter',
      symbol: 'rect',
      itemStyle: {
        opacity: 1,
      },
      color: score_color[i]
    })
  }
  const gridsize = 0.14
  const gapsize = 0.03
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (d[i][j] === undefined) {
        continue
      }
      const rowsize = Math.ceil(d[i][j].length/3)
      d[i][j].forEach((v, idx) => {
        const height = (rowsize-1)*(gridsize+gapsize)
        const x = i+1-(gridsize+gapsize)+(gridsize+gapsize)*(idx%3)
        const y = j+1+height/2 - (gridsize+gapsize)*Math.floor(idx/3)

        if (d[i][j].length === 1) {
          grids[v.scores[2]-1].data.push([i+1, j+1, v.id])
        } else {
          grids[v.scores[2]-1].data.push([x,y,v.id])
        }
      })
    }
  }
  return grids
}
function computeGridOrganizedData() {
  const d = new Array(5)
  for (let i = 0; i < 5; i++) {
    d[i] = new Array(5)
    for (let j = 0; j < 5; j++) {
      d[i][j] = []
    }
  }
  let sum = 0
  let count = 0
  for (const [id, v] of Object.entries(references)) {
    if (deactivatedFilters.indexOf(v.category) === -1 && 
    deactivatedFilters.indexOf(v.keyword) == -1 ///&&
    // v.scores[0] >= $('#slider-definition').slider('option', 'value') &&
    // v.scores[1] >= $('#slider-intention').slider('option', 'value') &&
    // v.scores[2] >= $('#slider-property').slider('option', 'value')
    ){
      v.id = id
      d[v.scores[0]-1][v.scores[1]-1].push(v)

      sum += (v.scores[0] + v.scores[1] + v.scores[2])/3
      count++
    }
  }
  const score = $('#slider-definition').slider('option', 'value')+$('#slider-intention').slider('option', 'value')+$('#slider-property').slider('option', 'value')
  console.log()
  $('#slider-overall').slider('option', 'value', 100*(score/3-0.5)/(5-1))

  // sort z values!
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      d[i][j].sort((a, b) => {
        return b.scores[2] - a.scores[2]
      })
    }
  }
  return d
}
function computeGridSeries(grids) {
  const lines = [{
    type: 'scatter',
    markLine: {
        silent: true,
        symbol: 'none',
        label: { 
          show: true, 
          position: 'start', 
          color: 'black',
          fontSize: 15
        },
        animationDuration: 300,
        data: [
          {
              xAxis: 5,
              lineStyle: {
                opacity: 0.1,
                color: '#88b775',
                width: 2,
                type: 'solid'
              }
          },
          {
              xAxis: 1,
              lineStyle: {
                opacity: 0.1,
                color: '#88b775',
                width: 2,
                type: 'solid'
              }
          },
          {
              xAxis: 2,
              lineStyle: {
                opacity: 0.1,
                color: '#88b775',
                width: 2,
                type: 'solid'
              }
          },
          {
              xAxis: 3,
              lineStyle: {
                opacity: 0.1,
                color: '#88b775',
                width: 2,
                type: 'solid'
              }
          },
          {
              xAxis: 4,
              lineStyle: {
                opacity: 0.1,
                color: '#88b775',
                  width: 2,
                  type: 'solid'
              }
          },
          {
              yAxis: 5,
              lineStyle: {
                opacity: 0.1,
                color: '#88b775',
                  width: 2,
                  type: 'solid'
              }
          },
          {
            yAxis: 1,
              lineStyle: {
                opacity: 0.1,
                color: '#88b775',
                  width: 2,
                  type: 'solid'
              }
          },
          {
              yAxis: 2,
              lineStyle: {
                  opacity: 0.1,
                  color: '#88b775',
                  width: 2,
                  type: 'solid'
              }
          },
          {
              yAxis: 3,
              lineStyle: {
                opacity: 0.1,
                color: '#88b775',
                  width: 2,
                  type: 'solid'
              }
          },
          {
              yAxis: 4,
              lineStyle: {
                opacity: 0.1,
                color: '#88b775',
                  width: 2,
                  type: 'solid'
              }
          },
        ]
    }
  }]
  return grids.concat(lines)
}