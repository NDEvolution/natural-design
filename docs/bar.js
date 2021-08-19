// Bar figure implementation
// ==========================

// 9E0142 = Software and its Engineering
// E95C45 = Theory of Computation
// FDBF6E = Hardware
// AFA27D = Computer Systems Organization
// FDFFBE = Human-centered Computing
// BEE49F = Information Systems
// B2D3CD = Applied Computing
// 54ADAC = Computing Methodologies
// 5E4FA2 = Social and Professional Topics
// C189D3 = General and Reference
// D18B8B = Networks
const acm_ccs = {
  '1': {name: 'Software and its Engineering', color: '#9E0142'}, 
  '2': {name: 'Theory of Computation', color: '#E95C45'}, 
  '3': {name: 'Hardware', color: '#FDBF6E'}, 
  '4': {name: 'Computer Systems Organization', color: '#AFA27D'}, 
  '5': {name: 'Human-centered Computing', color: '#e5e88f'}, // changed
  '6': {name: 'Information Systems', color: '#BEE49F'}, 
  '7': {name: 'Applied Computing', color: '#B2D3CD'}, 
  '8': {name: 'Computing Methodologies', color: '#54ADAC'}, 
  '9': {name: 'Social and Professional Topics', color: '#5E4FA2'}, 
 '10': {name: 'General and Reference', color: '#C189D3'}, 
 '11': {name: 'Networks', color: '#D18B8B'}, 
}

const ccs_names = []
Object.values(acm_ccs).forEach(v => {
  ccs_names.push(v.name)
})
const ccs_colors = []
Object.values(acm_ccs).forEach(v => {
  ccs_colors.push(v.color)
})

const year = []
for (let i = 1979; i <= 2021; i++) {
 year.push(`${i}`)
}

const bar_series = []
const ccs_year_papers = {
 // ccs { year : [paper1, paper2, ...]}
}
Object.values(acm_ccs).forEach(v => {
 const data_count = new Array(2021-1979+1)
 data_count.fill(0)
 ccs_year_papers[v.name] = {}
 Object.values(references).forEach(vv => {
   if (vv.ccs === v.name) {
      data_count[vv.year-1979]++
      if (ccs_year_papers[v.name][vv.year] == null) {
        ccs_year_papers[v.name][vv.year] = []
      }
      ccs_year_papers[v.name][vv.year].push(vv)
   }
 })
  const serie = {
    type: 'bar',
    label: { show: true, position: 'insideRight' },
    name:  v.name,
    stack: 'total-paper',
    data: data_count,
    color: v.color,
    label: {
      show: false,
      margin: 0,
    },
  }
  bar_series.push(serie)
})


function computePieData(yearmin, yearmax) {
  let pie_data = {
    'Software and its Engineering': { name: 'Software and its Engineering', value: 0 },
    'Theory of Computation': { name: 'Theory of Computation', value: 0 },
    'Hardware': { name: 'Hardware', value: 0 },
    'Computer Systems Organization': { name: 'Computer Systems Organization', value: 0 },
    'Human-centered Computing': { name: 'Human-centered Computing', value: 0 },
    'Information Systems': { name: 'Information Systems', value: 0 },
    'Applied Computing': { name: 'Applied Computing', value: 0 },
    'Computing Methodologies': { name: 'Computing Methodologies', value: 0 },
    'Social and Professional Topics': { name: 'Social and Professional Topics', value: 0 },
    'General and Reference': { name: 'General and Reference', value: 0 },
    'Networks': { name: 'Networks', value: 0 },
  }
  Object.values(references).forEach(v => {
    if (v.year >= yearmin && v.year <= yearmax) {
      pie_data[v.ccs].value++
    }
  })
  return Object.values(pie_data)
}

function computeFinalSeries(yearmin, yearmax) {
  let final_fig_series = []
  final_fig_series.push({
    type: 'pie',
    stillShowZeroSum: false,
    label: { show: false },
    color: ccs_colors,
    radius: [0, '30%'],
    center: ['85%', '50%'],
    data: computePieData(yearmin, yearmax),
  })
  final_fig_series.push({
    type: 'pie',
    stillShowZeroSum: false,
    label: {
      position: 'inside',
      alignTo: 'edge',
      formatter: '{c}',
      color: '#fff'
    },
    color: ccs_colors,
    radius: ['20%', '30%'],
    center: ['85%', '50%'],
    data: computePieData(yearmin, yearmax)
  })
  return final_fig_series.concat(bar_series)
}

function computeOptions(yearmin, yearmax) {
  return {
    tooltip: {
      trigger: 'item',
      triggerOn: 'click',
    },
    title: [{
      text: 'a) YEAR GROWTH OF PAPERS ON NATURAL DESIGN',
      left: '40%',
      textAlign: 'center'
    }, {
      text: 'b) ACM CCS CLUSTERS',
      left: '85%',
      textAlign: 'center'
    }],
    dataZoom: { show: false },
    legend: {
      show: false,
    },
    grid: [{
        top: '10%',
        width: '60%',
    }],
    yAxis: {
      type: 'value',
      min: 0,
      max: 10,
      interval: 1,
    },
    xAxis: {
      type: 'category',
      data: year,
      splitLine: {
        show: true,
        interval: 0,
      },
    },
    series: computeFinalSeries(yearmin, yearmax),
  }
}

const barFig = echarts.init(document.getElementById('bar-fig'))
barFig.setOption(computeOptions(1979, 2021))
barFig.on('click', params => {
  const refs = []
  if (params.componentSubType === 'bar') {
    ccs_year_papers[params.seriesName][params.name].forEach(v => {
      refs.push(v.section)
    })
  }
  if (params.componentSubType === 'pie') {
    Object.values(ccs_year_papers[params.name]).forEach(v => {
        v.forEach(vv => {
          refs.push(vv.section)
        })
    })
  }
  if ($('#bar-reference').length > 0) {
    $('#bar-reference').remove()
  }
  if (refs.length > 0) {
    $('#bar').append($('<div/>', {
      id: 'bar-reference',
      class: 'reference',
    }))
    refs.forEach(ref => {
      $('#bar-reference').append($(`<p>${ref}</p>`))
    })
    return
  }
  // if nothing is selected, then delete!
  $('#bar-reference').remove()
})

// for year slider
function year2percent(year) {
 return ((year-1979)*100/(2021-1979))
}
$( "#slider-year" ).slider({
 range: true,
 min: 1979,
 max: 2021,
 step: 1,
 values: [1979, 2021],
 // HACK: need map between -3%-97%
 slide: (event, ui) => {
   if (ui.values[1] - ui.values[0] < 0) {
     return false
   }
   $("#year-label-left").css('left', `${year2percent(ui.values[0])-3}%`).text(ui.values[0])
   $("#year-label-right").css('left', `${year2percent(ui.values[1])-3 }%`).text(ui.values[1]);
   barFig.setOption(computeOptions(ui.values[0], ui.values[1]))
   barFig.dispatchAction({
       type: 'dataZoom',
       start: year2percent(ui.values[0]),
       end: year2percent(ui.values[1]),
   })
 },
 create: (event, ui) => {
   $("#year-label-left").css('left', '-3%').text('1979');
   $("#year-label-right").css('left', "97%").text('2021');
 }
}).trigger('slide')

// for ccs buttons
ccs_names.forEach((name, idx) => {
 $('#acm-ccs').append(
   // a ccs category button
   $('<div/>', {
     'text': name,
     'class': 'button noselect',
     'style': `
       border: 2px solid ${ccs_colors[idx]};
     `
   }).hover(function() {
     if ($(this).hasClass('button-deactivate')) {
       $(this).css('background-color', '#b4b4b4')
       $(this).css('color', 'white')
     }
     else {
       $(this).css('color', 'white')
       $(this).css('background-color', ccs_colors[idx])
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
       $(this).removeClass('button-deactivate')
       $(this).css('background-color', ccs_colors[idx])
       $(this).css('border', `2px solid ${ccs_colors[idx]}`)
     } else {
       $(this).addClass('button-deactivate')
       $(this).css('background-color', '#b4b4b4')
       $(this).css('border', `2px solid #b4b4b4`)
     }
     barFig.dispatchAction({
       type: 'legendToggleSelect',
       name: name,
     })
   })
 )
})