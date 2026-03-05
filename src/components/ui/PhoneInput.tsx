import React, { useState, useEffect } from 'react'
import { countries, Country } from '@/lib/countries'

interface PhoneInputProps {
  value: string
  onChange: (phone: string, countryCode: string, country: string) => void
  error?: string
  placeholder?: string
  disabled?: boolean
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error,
  placeholder = 'Numéro de téléphone',
  disabled = false
}) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0])
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Détecter le pays à partir du numéro complet au chargement
  useEffect(() => {
    if (value && value.startsWith('+')) {
      const detectedCountry = countries.find(c => value.startsWith(c.dialCode))
      if (detectedCountry) {
        setSelectedCountry(detectedCountry)
        setPhoneNumber(value.substring(detectedCountry.dialCode.length))
      }
    } else if (value) {
      setPhoneNumber(value)
    }
  }, [])

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country)
    setIsDropdownOpen(false)
    setSearchQuery('')
    
    // Mettre à jour le numéro complet
    const fullPhone = country.dialCode + phoneNumber
    onChange(fullPhone, country.iso2, country.name)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/[^\d]/g, '') // Garder seulement les chiffres
    
    setPhoneNumber(input)
    
    // Détecter automatiquement le pays si le numéro commence par un code pays
    if (input.length >= 3) {
      const fullNumber = '+' + input
      const detectedCountry = countries.find(c => fullNumber.startsWith(c.dialCode))
      
      if (detectedCountry && detectedCountry.code !== selectedCountry.code) {
        setSelectedCountry(detectedCountry)
        input = fullNumber.substring(detectedCountry.dialCode.length)
        setPhoneNumber(input)
      }
    }
    
    // Mettre à jour le numéro complet
    const fullPhone = selectedCountry.dialCode + input
    onChange(fullPhone, selectedCountry.iso2, selectedCountry.name)
  }

  // Filtrer les pays selon la recherche
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="relative">
      <div className="flex">
        {/* Sélecteur de pays */}
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className={`
              flex items-center gap-2 px-3 py-2 border border-r-0 rounded-l-lg
              bg-neutral-50 dark:bg-neutral-800
              border-neutral-300 dark:border-neutral-600
              hover:bg-neutral-100 dark:hover:bg-neutral-700
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition-colors
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${error ? 'border-red-500 dark:border-red-500' : ''}
            `}
          >
            <span className="text-xl">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {selectedCountry.dialCode}
            </span>
            <svg
              className={`w-4 h-4 text-neutral-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => {
                  setIsDropdownOpen(false)
                  setSearchQuery('')
                }}
              />
              <div className="absolute z-20 mt-1 w-80 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg shadow-lg">
                {/* Barre de recherche */}
                <div className="p-2 border-b border-neutral-200 dark:border-neutral-700">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un pays..."
                    className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md
                      bg-white dark:bg-neutral-900
                      text-neutral-900 dark:text-neutral-100
                      placeholder-neutral-400 dark:placeholder-neutral-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                {/* Liste des pays */}
                <div className="max-h-60 overflow-y-auto">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountryChange(country)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-2 text-left
                          hover:bg-neutral-100 dark:hover:bg-neutral-700
                          transition-colors
                          ${selectedCountry.code === country.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                        `}
                      >
                        <span className="text-xl">{country.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {country.name}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            {country.dialCode}
                          </div>
                        </div>
                        {selectedCountry.code === country.code && (
                          <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
                      Aucun pays trouvé
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Champ de saisie du numéro */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            flex-1 px-3 py-2 border rounded-r-lg
            bg-white dark:bg-neutral-900
            border-neutral-300 dark:border-neutral-600
            text-neutral-900 dark:text-neutral-100
            placeholder-neutral-400 dark:placeholder-neutral-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
            ${error ? 'border-red-500 dark:border-red-500' : ''}
          `}
        />
      </div>

      {/* Message d'erreur */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Aperçu du numéro complet */}
      {phoneNumber && (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Numéro complet: {selectedCountry.dialCode}{phoneNumber}
        </p>
      )}
    </div>
  )
}
