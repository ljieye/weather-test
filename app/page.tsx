'use client';

import { useState, useEffect, useCallback } from 'react';

interface WeatherData {
  name: string;
  country: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  pressure: number;
  visibility: number;
  sunrise: string;
  sunset: string;
}

const popularCities = [
  { name: '北京', country: '中国', lat: 39.9042, lon: 116.4074 },
  { name: '上海', country: '中国', lat: 31.2304, lon: 121.4737 },
  { name: '广州', country: '中国', lat: 23.1291, lon: 113.2644 },
  { name: '深圳', country: '中国', lat: 22.3193, lon: 114.1694 },
  { name: '杭州', country: '中国', lat: 30.2741, lon: 120.1551 },
  { name: '成都', country: '中国', lat: 30.5728, lon: 104.0668 },
  { name: '西安', country: '中国', lat: 34.3416, lon: 108.9398 },
  { name: '南京', country: '中国', lat: 32.0603, lon: 118.7969 },
  { name: '武汉', country: '中国', lat: 30.5928, lon: 114.3055 },
  { name: '重庆', country: '中国', lat: 29.4316, lon: 106.9123 },
  { name: '东京', country: '日本', lat: 35.6762, lon: 139.6503 },
  { name: '首尔', country: '韩国', lat: 37.5665, lon: 126.9780 },
  { name: '纽约', country: '美国', lat: 40.7128, lon: -74.0060 },
  { name: '伦敦', country: '英国', lat: 51.5074, lon: -0.1278 },
  { name: '巴黎', country: '法国', lat: 48.8566, lon: 2.3522 },
  { name: '柏林', country: '德国', lat: 52.5200, lon: 13.4050 },
  { name: '罗马', country: '意大利', lat: 41.9028, lon: 12.4964 },
  { name: '马德里', country: '西班牙', lat: 40.4168, lon: -3.7038 },
  { name: '莫斯科', country: '俄罗斯', lat: 55.7558, lon: 37.6176 },
  { name: '悉尼', country: '澳大利亚', lat: -33.8688, lon: 151.2093 },
];

const getWeatherIcon = (iconCode: string) => {
  const iconMap: { [key: string]: string } = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };
  return iconMap[iconCode] || '🌤️';
};

const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCity, setCurrentCity] = useState(popularCities[0]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchWeather = useCallback(async (city: typeof popularCities[0]) => {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      setError('API Key 未配置，请在环境变量中设置 NEXT_PUBLIC_OPENWEATHER_API_KEY');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric&lang=zh_cn`
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API Key 无效，请检查环境变量配置');
        } else if (response.status === 429) {
          throw new Error('API 请求次数超限，请稍后再试');
        } else {
          throw new Error(`请求失败: ${response.status}`);
        }
      }

      const data = await response.json();
      
      setWeatherData({
        name: city.name,
        country: city.country,
        temperature: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        wind_speed: data.wind.speed,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        pressure: data.main.pressure,
        visibility: data.visibility / 1000, // 转换为公里
        sunrise: formatTime(data.sys.sunrise),
        sunset: formatTime(data.sys.sunset),
      });
    } catch (error) {
      console.error('获取天气数据失败:', error);
      setError(error instanceof Error ? error.message : '获取天气数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCitySelect = (city: typeof popularCities[0]) => {
    setCurrentCity(city);
    fetchWeather(city);
  };

  const getRandomCity = () => {
    const randomCity = popularCities[Math.floor(Math.random() * popularCities.length)];
    setCurrentCity(randomCity);
    fetchWeather(randomCity);
  };

  // 自动刷新功能
  useEffect(() => {
    if (autoRefresh) {
      fetchWeather(currentCity);
      const interval = setInterval(() => {
        fetchWeather(currentCity);
      }, 300000); // 每5分钟刷新一次

      return () => clearInterval(interval);
    }
  }, [currentCity, autoRefresh, fetchWeather]);

  // 初始加载
  useEffect(() => {
    fetchWeather(currentCity);
  }, [fetchWeather]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🌍 全球天气
            </h1>
            <p className="text-gray-600">使用 OpenWeatherMap API 获取实时天气信息</p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* 左侧：城市选择 */}
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">选择城市</h2>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {popularCities.map((city) => (
                  <button
                    key={`${city.name}-${city.country}`}
                    onClick={() => handleCitySelect(city)}
                    disabled={loading}
                    className={`p-3 text-sm rounded-lg transition-all ${
                      currentCity.name === city.name && currentCity.country === city.country
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <button
                  onClick={getRandomCity}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🎲 随机城市
                </button>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-700">自动刷新</label>
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoRefresh ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoRefresh ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* 右侧：天气信息显示 */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">正在获取天气数据...</p>
                </div>
              ) : weatherData ? (
                <div className="space-y-6">
                  {/* 主要天气信息 */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center">
                    <div className="text-6xl mb-4">{getWeatherIcon(weatherData.icon)}</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {weatherData.name}, {weatherData.country}
                    </h2>
                    <p className="text-lg text-gray-600 mb-4">{weatherData.description}</p>
                    <div className="text-5xl font-bold text-gray-800 mb-4">
                      {Math.round(weatherData.temperature)}°C
                    </div>
                    <p className="text-gray-600">体感温度: {Math.round(weatherData.feels_like)}°C</p>
                  </div>

                  {/* 详细信息网格 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/50 rounded-lg p-4 text-center">
                      <div className="text-blue-600 font-semibold mb-1">湿度</div>
                      <div className="text-2xl font-bold text-blue-800">{weatherData.humidity}%</div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-4 text-center">
                      <div className="text-green-600 font-semibold mb-1">风速</div>
                      <div className="text-2xl font-bold text-green-800">{weatherData.wind_speed} m/s</div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-4 text-center">
                      <div className="text-purple-600 font-semibold mb-1">气压</div>
                      <div className="text-2xl font-bold text-purple-800">{weatherData.pressure} hPa</div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-4 text-center">
                      <div className="text-orange-600 font-semibold mb-1">能见度</div>
                      <div className="text-2xl font-bold text-orange-800">{weatherData.visibility} km</div>
                    </div>
                  </div>

                  {/* 日出日落时间 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 text-center">
                      <div className="text-yellow-600 font-semibold mb-2">🌅 日出</div>
                      <div className="text-xl font-bold text-yellow-800">{weatherData.sunrise}</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 text-center">
                      <div className="text-purple-600 font-semibold mb-2">🌇 日落</div>
                      <div className="text-xl font-bold text-purple-800">{weatherData.sunset}</div>
                    </div>
                  </div>

                  {/* 最后更新时间 */}
                  <div className="text-center text-sm text-gray-500">
                    最后更新: {new Date().toLocaleString('zh-CN')}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
