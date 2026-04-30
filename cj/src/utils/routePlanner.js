function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

function uniqueStops(route) {
  const stops = []

  if (route.from) stops.push(route.from)
  if (Array.isArray(route.pathPreview)) stops.push(...route.pathPreview)
  if (route.to) stops.push(route.to)

  const seen = new Set()
  return stops.filter((stop) => {
    const key = normalize(stop)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function matchScore(query, candidate) {
  const q = normalize(query)
  const c = normalize(candidate)

  if (!q || !c) return 0
  if (q === c) return 100
  if (c.includes(q)) return 80
  if (q.includes(c)) return 70

  const qWords = q.split(' ')
  const cWords = c.split(' ')
  const overlap = qWords.filter((w) => cWords.includes(w)).length
  if (overlap > 0) return overlap * 20

  return 0
}

function buildKnownLocations(routes, places) {
  const locationMap = new Map()

  routes.forEach((route) => {
    uniqueStops(route).forEach((stop) => {
      const key = normalize(stop)
      if (!locationMap.has(key)) {
        locationMap.set(key, {
          type: 'stop',
          name: stop,
          source: 'bus-stop',
        })
      }
    })
  })

  places.forEach((place) => {
    const nameKey = normalize(place.name)
    if (!locationMap.has(nameKey)) {
      locationMap.set(nameKey, {
        type: 'place',
        name: place.name,
        area: place.area,
        source: 'place',
      })
    }

    const areaKey = normalize(place.area)
    if (areaKey && !locationMap.has(areaKey)) {
      locationMap.set(areaKey, {
        type: 'area',
        name: place.area,
        source: 'place-area',
      })
    }
  })

  return Array.from(locationMap.values())
}

export function getLocationSuggestions(query, routes, places, limit = 8) {
  const knownLocations = buildKnownLocations(routes, places)
  const q = normalize(query)

  if (!q) return knownLocations.slice(0, limit)

  return knownLocations
    .map((item) => ({
      ...item,
      score:
        matchScore(q, item.name) +
        (item.area ? matchScore(q, item.area) * 0.6 : 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

function resolveLocation(input, routes, places) {
  const knownLocations = buildKnownLocations(routes, places)

  let best = null
  let bestScore = 0

  for (const item of knownLocations) {
    const score =
      matchScore(input, item.name) +
      (item.area ? matchScore(input, item.area) * 0.6 : 0)

    if (score > bestScore) {
      bestScore = score
      best = item
    }
  }

  return bestScore >= 40 ? best : null
}

function findBestStopForLocation(location, routes, places) {
  if (!location) return null

  const stopCandidates = []

  routes.forEach((route) => {
    uniqueStops(route).forEach((stop) => {
      const score = matchScore(location.name, stop)
      if (score > 0) {
        stopCandidates.push({
          stop,
          score,
        })
      }
    })
  })

  if (location.type === 'place') {
    const place = places.find((p) => normalize(p.name) === normalize(location.name))

    if (place) {
      routes.forEach((route) => {
        uniqueStops(route).forEach((stop) => {
          const score =
            matchScore(place.name, stop) +
            matchScore(place.area, stop) * 0.8
          if (score > 0) {
            stopCandidates.push({
              stop,
              score,
            })
          }
        })
      })
    }
  }

  if (!stopCandidates.length) return null

  stopCandidates.sort((a, b) => b.score - a.score)
  return stopCandidates[0].stop
}

function getRouteStops(route) {
  return uniqueStops(route)
}

function findDirectBuses(sourceStop, destinationStop, routes) {
  const options = []

  routes.forEach((route) => {
    const stops = getRouteStops(route)
    const sourceIndex = stops.findIndex((s) => normalize(s) === normalize(sourceStop))
    const destinationIndex = stops.findIndex(
      (s) => normalize(s) === normalize(destinationStop)
    )

    if (
      sourceIndex !== -1 &&
      destinationIndex !== -1 &&
      sourceIndex < destinationIndex
    ) {
      options.push({
        type: 'direct',
        routeId: route.id,
        routeNo: route.routeNo,
        routeType: route.routeType,
        category: route.category,
        from: route.from,
        to: route.to,
        boardAt: stops[sourceIndex],
        getDownAt: stops[destinationIndex],
        fareMin: route.fareMin,
        fareMax: route.fareMax,
        headwayMinutes: route.headwayMinutes,
        stopsCovered: destinationIndex - sourceIndex,
        fullRoute: route,
      })
    }
  })

  return options.sort((a, b) => a.stopsCovered - b.stopsCovered)
}

function findOneChangeBuses(sourceStop, destinationStop, routes) {
  const options = []

  routes.forEach((routeA) => {
    const stopsA = getRouteStops(routeA)
    const sourceIndex = stopsA.findIndex((s) => normalize(s) === normalize(sourceStop))
    if (sourceIndex === -1) return

    const onwardStops = stopsA.slice(sourceIndex + 1)

    onwardStops.forEach((interchangeStop, interchangeIndexOffset) => {
      routes.forEach((routeB) => {
        if (routeA.id === routeB.id) return

        const stopsB = getRouteStops(routeB)
        const interchangeIndexB = stopsB.findIndex(
          (s) => normalize(s) === normalize(interchangeStop)
        )
        const destinationIndexB = stopsB.findIndex(
          (s) => normalize(s) === normalize(destinationStop)
        )

        if (
          interchangeIndexB !== -1 &&
          destinationIndexB !== -1 &&
          interchangeIndexB < destinationIndexB
        ) {
          options.push({
            type: 'one-change',
            firstBus: {
              routeId: routeA.id,
              routeNo: routeA.routeNo,
              routeType: routeA.routeType,
              category: routeA.category,
              boardAt: sourceStop,
              getDownAt: interchangeStop,
              fareMin: routeA.fareMin,
              fareMax: routeA.fareMax,
              headwayMinutes: routeA.headwayMinutes,
              stopsCovered: interchangeIndexOffset + 1,
              fullRoute: routeA,
            },
            secondBus: {
              routeId: routeB.id,
              routeNo: routeB.routeNo,
              routeType: routeB.routeType,
              category: routeB.category,
              boardAt: interchangeStop,
              getDownAt: destinationStop,
              fareMin: routeB.fareMin,
              fareMax: routeB.fareMax,
              headwayMinutes: routeB.headwayMinutes,
              stopsCovered: destinationIndexB - interchangeIndexB,
              fullRoute: routeB,
            },
            interchangeStop,
            totalApproxFareMin: Number(routeA.fareMin || 0) + Number(routeB.fareMin || 0),
            totalApproxFareMax: Number(routeA.fareMax || 0) + Number(routeB.fareMax || 0),
            totalStops:
              interchangeIndexOffset + 1 + (destinationIndexB - interchangeIndexB),
          })
        }
      })
    })
  })

  return options.sort((a, b) => a.totalStops - b.totalStops)
}

export function planBusJourney(sourceInput, destinationInput, routes, places) {
  const sourceLocation = resolveLocation(sourceInput, routes, places)
  const destinationLocation = resolveLocation(destinationInput, routes, places)

  if (!sourceLocation || !destinationLocation) {
    return {
      success: false,
      message: 'Could not clearly identify source or destination.',
      sourceLocation,
      destinationLocation,
      sourceStop: null,
      destinationStop: null,
      directOptions: [],
      oneChangeOptions: [],
    }
  }

  const sourceStop = findBestStopForLocation(sourceLocation, routes, places)
  const destinationStop = findBestStopForLocation(destinationLocation, routes, places)

  if (!sourceStop || !destinationStop) {
    return {
      success: false,
      message: 'Could not map source or destination to a known bus stop.',
      sourceLocation,
      destinationLocation,
      sourceStop,
      destinationStop,
      directOptions: [],
      oneChangeOptions: [],
    }
  }

  const directOptions = findDirectBuses(sourceStop, destinationStop, routes)
  const oneChangeOptions =
    directOptions.length === 0
      ? findOneChangeBuses(sourceStop, destinationStop, routes)
      : []

  return {
    success: directOptions.length > 0 || oneChangeOptions.length > 0,
    message:
      directOptions.length > 0
        ? 'Direct bus found.'
        : oneChangeOptions.length > 0
        ? 'No direct bus found, but a 1-change option is available.'
        : 'No suitable route found with current data.',
    sourceLocation,
    destinationLocation,
    sourceStop,
    destinationStop,
    directOptions,
    oneChangeOptions,
  }
}