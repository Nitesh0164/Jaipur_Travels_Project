import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Wind, Droplets, Sun, CloudRain, Cloud, ThermometerSun } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import { get } from '../lib/api'

const bgGradients = {
  'Sunny': 'from-blue-400 to-orange-200',
  'Clear': 'from-indigo-400 to-purple-400',
  'Cloudy': 'from-gray-400 to-blue-200',
  'Rainy': 'from-slate-700 to-blue-800',
  'Partly cloudy': 'from-gray-300 to-blue-300',
  'Overcast': 'from-gray-500 to-gray-300',
}

export default function WeatherPage() {
  const [city, setCity] = useState('Jaipur')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch weather on initial load
  useEffect(() => {
    fetchWeather('Jaipur')
  }, [])

  const fetchWeather = async (searchCity) => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch current weather and forecast in parallel
      const [currentData, forecastData] = await Promise.all([
        get(`/api/weather/current?city=${encodeURIComponent(searchCity)}`, { auth: false }),
        get(`/api/weather/forecast?city=${encodeURIComponent(searchCity)}`, { auth: false }),
      ])

      // Map current weather
      const current = currentData?.current
      if (current) {
        setWeather({
          city: currentData.city || searchCity,
          temp: Number(current.tempC ?? 0),
          feelsLike: Number(current.feelsLikeC ?? current.tempC ?? 0),
          condition: current.condition || current.description || 'Clear',
          description: current.description || current.condition || '',
          humidity: current.humidity ?? 0,
          windSpeed: Number(current.windSpeedKmh ?? 0),
          icon: current.icon || '',
        })
      } else {
        // Fallback if structure is different
        setWeather({
          city: searchCity,
          temp: 0,
          feelsLike: 0,
          condition: 'Clear',
          description: '',
          humidity: 0,
          windSpeed: 0,
        })
      }

      // Map forecast
      const days = forecastData?.forecast ?? []
      const mappedForecast = days.slice(0, 5).map((d) => {
        const dateObj = d.date ? new Date(d.date) : new Date()
        return {
          day: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
          temp: Number(d.tempMaxC ?? d.tempMinC ?? 0),
          tempMin: Number(d.tempMinC ?? 0),
          tempMax: Number(d.tempMaxC ?? 0),
          icon: mapConditionToIcon(d.condition || d.description || 'clear'),
          condition: d.condition || d.description || 'Clear',
        }
      })
      setForecast(mappedForecast)
    } catch (err) {
      console.error('[Weather] fetch failed:', err.message)
      setError(err.message)
      // Set fallback data
      setWeather({
        city: searchCity,
        temp: 32,
        feelsLike: 34,
        condition: 'Sunny',
        humidity: 45,
        windSpeed: 12,
      })
      setForecast([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!city.trim()) return
    fetchWeather(city.trim())
  }

  const getIcon = (condition, size = 24) => {
    const c = String(condition || '').toLowerCase()
    if (c.includes('rain') || c.includes('drizzle') || c.includes('thunder')) {
      return <CloudRain size={size} className="text-blue-400" />
    }
    if (c.includes('cloud') || c.includes('overcast')) {
      return <Cloud size={size} className="text-gray-300" />
    }
    return <Sun size={size} className="text-amber-400" />
  }

  const activeGradient = weather
    ? (bgGradients[weather.condition] || findClosestGradient(weather.condition) || bgGradients['Sunny'])
    : bgGradients['Sunny']

  return (
    <div className="min-h-screen flex flex-col bg-sand">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 pb-24">
        
        {/* Search Bar */}
        <div className="mb-8 relative max-w-md mx-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Search city weather..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-border bg-white/80 backdrop-blur-sm focus:border-primary focus:outline-none transition-colors font-semibold text-ink"
              />
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="bg-primary text-white p-3 rounded-2xl hover:bg-primary-dark transition-colors shadow-3d disabled:opacity-50"
            >
              <Search size={20} />
            </button>
          </form>
        </div>

        {/* Error banner */}
        {error && (
          <div className="max-w-md mx-auto mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            ⚠️ Could not fetch live weather: {error}. Showing cached/fallback data.
          </div>
        )}

        {/* Weather Dashboard */}
        {weather && (
          <motion.div 
            key={weather.city}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br ${activeGradient} transition-colors duration-1000`}
          >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
              {weather.condition === 'Rainy' && (
                <motion.div 
                  animate={{ y: [0, 100], opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjIwIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxNSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')] bg-repeat"
                />
              )}
              {(weather.condition === 'Sunny' || weather.condition === 'Clear') && (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
                  className="absolute -top-32 -right-32 w-96 h-96 bg-yellow-300 rounded-full blur-[100px] opacity-60"
                />
              )}
            </div>

            <div className="relative z-10 p-8 md:p-12 text-white">
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                    <div className="text-center md:text-left">
                      <h1 className="text-4xl md:text-5xl font-black mb-2 drop-shadow-md">{weather.city}</h1>
                      <p className="text-lg font-semibold opacity-90 capitalize flex items-center justify-center md:justify-start gap-2">
                        {getIcon(weather.condition, 20)} {weather.condition}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {getIcon(weather.condition, 64)}
                      <div className="text-7xl font-black drop-shadow-lg">
                        {weather.temp}°
                      </div>
                    </div>
                  </div>

                  {/* Current Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                    <div className="bg-black/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border border-white/20">
                      <Droplets size={24} className="opacity-80" />
                      <div>
                        <p className="text-xs font-bold uppercase opacity-70">Humidity</p>
                        <p className="text-xl font-black">{weather.humidity}%</p>
                      </div>
                    </div>
                    <div className="bg-black/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 border border-white/20">
                      <Wind size={24} className="opacity-80" />
                      <div>
                        <p className="text-xs font-bold uppercase opacity-70">Wind</p>
                        <p className="text-xl font-black">{weather.windSpeed} km/h</p>
                      </div>
                    </div>
                    <div className="hidden md:flex bg-black/10 backdrop-blur-md rounded-2xl p-4 items-center gap-4 border border-white/20">
                      <ThermometerSun size={24} className="opacity-80" />
                      <div>
                        <p className="text-xs font-bold uppercase opacity-70">Feels Like</p>
                        <p className="text-xl font-black">{weather.feelsLike}°</p>
                      </div>
                    </div>
                  </div>

                  {/* 5 Day Forecast */}
                  {forecast.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold uppercase mb-4 opacity-90 tracking-wider">5-Day Forecast</h3>
                      <div className="grid grid-cols-5 gap-2 md:gap-4">
                        {forecast.map((day, i) => (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={`${day.day}-${i}`}
                            className="bg-black/10 backdrop-blur-sm rounded-2xl p-3 flex flex-col items-center justify-center border border-white/10 hover:bg-black/20 transition-colors"
                          >
                            <p className="text-xs font-bold mb-2 opacity-80">{day.day}</p>
                            <div className="mb-2">
                              {getIcon(day.condition, 24)}
                            </div>
                            <p className="font-black text-lg">{day.tempMax}°</p>
                            <p className="text-[10px] opacity-60">{day.tempMin}°</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

/* ── Helpers ── */

function mapConditionToIcon(condition) {
  const c = String(condition).toLowerCase()
  if (c.includes('rain') || c.includes('drizzle')) return 'rain'
  if (c.includes('cloud') || c.includes('overcast')) return 'cloud'
  return 'sun'
}

function findClosestGradient(condition) {
  const c = String(condition).toLowerCase()
  if (c.includes('rain') || c.includes('drizzle') || c.includes('thunder')) return bgGradients['Rainy']
  if (c.includes('cloud') || c.includes('overcast') || c.includes('partly')) return bgGradients['Cloudy']
  if (c.includes('clear')) return bgGradients['Clear']
  return null
}
