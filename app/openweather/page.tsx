'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
}

const popularCities = [
  { name: '北京', country: 'CN', lat: 39.9042, lon: 116.4074 },
  { name: '上海', country: 'CN', lat: 31.2304, lon: 121.4737 },
  { name: '广州', country: 'CN', lat: 23.1291, lon: 113.2644 },
  { name: '深圳', country: 'CN', lat: 22.3193, lon: 114.1694 },
  { name: '杭州', country: 'CN', lat: 30.2741, lon: 120.1551 },
  { name: '成都', country: 'CN', lat: 30.5728, lon: 104.0668 },
  { name: '西安', country: 'CN', lat: 34.3416, lon: 108.9398 },
  { name: '南京', country: 'CN', lat: 32.0603, lon: 118.7969 },
  { name: '武汉', country: 'CN', lat: 30.5928, lon: 114.3055 },
  { name: '重庆', country: 'CN', lat: 29.4316, lon: 106.9123 },
  { name: '东京', country: 'JP', lat: 35.6762, lon: 139.6503 },
  { name: '首尔', country: 'KR', lat: 37.5665, lon: 126.9780 },
  { name: '纽约', country: 'US', lat: 40.7128, lon: -74.0060 },
  { name: '伦敦', country: 'GB', lat: 51.5074, lon: -0.1278 },
  { name: '巴黎', country: 'FR', lat: 48.8566, lon: 2.3522 },
  { name: '柏林', country: 'DE', lat: 52.5200, lon: 13.4050 },
  { name: '罗马', country: 'IT', lat: 41.9028, lon: 12.4964 },
  { name: '马德里', country: 'ES', lat: 40.4168, lon: -3.7038 },
  { name: '莫斯科', country: 'RU', lat: 55.7558, lon: 37.6176 },
  { name: '悉尼', country: 'AU', lat: -33.8688, lon: 151.2093 },
];

export default function OpenWeatherPage() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [selectedCity, setSelectedCity] = useState(popularCities[0]);
  const [customCity, setCustomCity] = useState('');
  const [customLat, setCustomLat] = useState('');
  const [customLon, setCustomLon] = useState('');

  const fetchWeather = async (lat: number, lon: number, cityName: string, countryCode: string) => {
    if (!apiKey) {
      setError('请输入 API Key');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=zh_cn`
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('API Key 无效，请检查您的 API Key');
        } else if (response.status === 429) {
          throw new Error('API 请求次数超限，请稍后再试');
        } else {
          throw new Error(`请求失败: ${response.status}`);
        }
      }

      const data = await response.json();
      
      setWeatherData({
        name: cityName,
        country: countryCode,
        temperature: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        wind_speed: data.wind.speed,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        pressure: data.main.pressure,
        visibility: data.visibility / 1000, // 转换为公里
      });
    } catch (error) {
      console.error('获取天气数据失败:', error);
      setError(error instanceof Error ? error.message : '获取天气数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (city: typeof popularCities[0]) => {
    setSelectedCity(city);
    fetchWeather(city.lat, city.lon, city.name, city.country);
  };

  const handleCustomCitySearch = () => {
    if (!customLat || !customLon) {
      setError('请输入经纬度坐标');
      return;
    }

    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);

    if (isNaN(lat) || isNaN(lon)) {
      setError('请输入有效的经纬度坐标');
      return;
    }

    fetchWeather(lat, lon, customCity || '自定义位置', 'Unknown');
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 导航栏 */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-white hover:text-blue-200 transition-colors"
          >
            ← 返回首页
          </Link>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            🌤️ OpenWeatherMap 天气
          </h1>

          {/* API Key 输入 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenWeatherMap API Key:
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="请输入您的 API Key"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              请从 <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenWeatherMap</a> 获取免费 API Key
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* 左侧：城市选择和天气显示 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">热门城市</h2>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {popularCities.map((city) => (
                  <button
                    key={`${city.name}-${city.country}`}
                    onClick={() => handleCitySelect(city)}
                    disabled={loading || !apiKey}
                    className={`p-3 text-sm rounded-lg transition-all ${
                      selectedCity.name === city.name && selectedCity.country === city.country
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {city.name}
                  </button>
                ))}
              </div>

              {/* 天气信息显示 */}
              {weatherData && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{getWeatherIcon(weatherData.icon)}</div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {weatherData.name}, {weatherData.country}
                    </h3>
                    <p className="text-gray-600">{weatherData.description}</p>
                  </div>

                  <div className="text-3xl font-bold text-gray-800 text-center mb-4">
                    {Math.round(weatherData.temperature)}°C
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="text-blue-600 font-semibold">体感温度</div>
                      <div className="text-lg font-bold text-blue-800">
                        {Math.round(weatherData.feels_like)}°C
                      </div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="text-green-600 font-semibold">湿度</div>
                      <div className="text-lg font-bold text-green-800">
                        {weatherData.humidity}%
                      </div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="text-purple-600 font-semibold">风速</div>
                      <div className="text-lg font-bold text-purple-800">
                        {weatherData.wind_speed} m/s
                      </div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-3">
                      <div className="text-orange-600 font-semibold">气压</div>
                      <div className="text-lg font-bold text-orange-800">
                        {weatherData.pressure} hPa
                      </div>
                    </div>
                  </div>

                  {weatherData.visibility && (
                    <div className="mt-4 bg-white/50 rounded-lg p-3">
                      <div className="text-gray-600 font-semibold">能见度</div>
                      <div className="text-lg font-bold text-gray-800">
                        {weatherData.visibility} km
                      </div>
                    </div>
                  )}
                </div>
              )}

              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">正在获取天气数据...</p>
                </div>
              )}
            </div>

            {/* 右侧：自定义城市搜索 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">自定义位置</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    城市名称 (可选):
                  </label>
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    placeholder="例如: 北京"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      纬度:
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={customLat}
                      onChange={(e) => setCustomLat(e.target.value)}
                      placeholder="例如: 39.9042"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      经度:
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={customLon}
                      onChange={(e) => setCustomLon(e.target.value)}
                      placeholder="例如: 116.4074"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCustomCitySearch}
                  disabled={loading || !apiKey}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🔍 搜索天气
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">💡 使用提示</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 您可以从 OpenWeatherMap 获取免费的 API Key</li>
                  <li>• 使用经纬度坐标可以精确获取任何位置的天气</li>
                  <li>• 纬度范围: -90 到 90，经度范围: -180 到 180</li>
                  <li>• 免费 API 每分钟限制 60 次请求</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 