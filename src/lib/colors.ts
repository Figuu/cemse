/**
 * Paleta de colores de CEMSE
 * 
 * Esta paleta incluye los colores principales, complementarios y otros colores
 * definidos específicamente para la aplicación CEMSE.
 */

// Colores principales - HEX exactos proporcionados
export const MAIN_COLORS = {
  blue: '#47b4d8',           // Color principal azul
  lightBlue: '#a8d8ed',       // Azul claro
  darkBlue: '#009ed0',        // Azul oscuro
} as const;

// Colores complementarios - HEX exactos proporcionados
export const COMPLEMENTARY_COLORS = {
  orangeEconomy: '#fd8419',      // Economía naranja
  purpleGender: '#805698',       // Empleabilidad y emprendimiento con igualdad de género
  greenEnvironment: '#86b300',   // Emprendimiento con impacto ambiental
  orangeLight: '#ffb246',        // Naranja claro
  purpleLight: '#a975c8',        // Púrpura claro
  greenLight: '#bbe043',         // Verde claro
} as const;

// Otros colores - HEX exactos proporcionados
export const OTHER_COLORS = {
  greenSuccess: '#3bab5f',       // Verde de éxito
  lightMint: '#e4f3f0',          // Menta claro
} as const;

// Clases de Tailwind CSS para usar en componentes
export const COLOR_CLASSES = {
  // Colores principales
  mainBlue: 'bg-main-blue text-white',
  mainBlueLight: 'bg-main-light-blue text-main-blue',
  mainDarkBlue: 'bg-main-dark-blue text-white',
  
  // Colores complementarios
  orangeEconomy: 'bg-orange-economy text-white',
  purpleGender: 'bg-purple-gender text-white',
  greenEnvironment: 'bg-green-environment text-white',
  orangeLight: 'bg-orange-light text-white',
  purpleLight: 'bg-purple-light text-white',
  greenLight: 'bg-green-light text-white',
  
  // Otros colores
  greenSuccess: 'bg-green-success text-white',
  lightMint: 'bg-light-mint text-green-success',
  
  // Variantes con opacidad para fondos
  mainBlueBg: 'bg-main-blue/10 text-main-blue',
  orangeEconomyBg: 'bg-orange-economy/10 text-orange-economy',
  purpleGenderBg: 'bg-purple-gender/10 text-purple-gender',
  greenEnvironmentBg: 'bg-green-environment/10 text-green-environment',
  greenSuccessBg: 'bg-green-success/10 text-green-success',
} as const;

// Mapeo semántico de colores por categoría
export const SEMANTIC_COLORS = {
  // Estados de aplicación
  applied: 'bg-main-blue/10 text-main-blue',
  reviewing: 'bg-orange-light/10 text-orange-light',
  shortlisted: 'bg-purple-gender/10 text-purple-gender',
  interview: 'bg-orange-economy/10 text-orange-economy',
  offered: 'bg-green-success/10 text-green-success',
  rejected: 'bg-red-100 text-red-800',
  
  // Categorías de cursos
  technology: 'bg-main-blue/10 text-main-blue',
  business: 'bg-green-environment/10 text-green-environment',
  design: 'bg-purple-gender/10 text-purple-gender',
  marketing: 'bg-orange-economy/10 text-orange-economy',
  languages: 'bg-purple-light/10 text-purple-light',
  health: 'bg-green-success/10 text-green-success',
  education: 'bg-main-dark-blue/10 text-main-dark-blue',
  arts: 'bg-orange-light/10 text-orange-light',
  science: 'bg-green-light/10 text-green-light',
  
  // Niveles de experiencia
  beginner: 'bg-green-success/10 text-green-success',
  intermediate: 'bg-orange-light/10 text-orange-light',
  advanced: 'bg-orange-economy/10 text-orange-economy',
  expert: 'bg-purple-gender/10 text-purple-gender',
} as const;

// Función helper para obtener colores por categoría
export const getColorByCategory = (category: string): string => {
  return SEMANTIC_COLORS[category as keyof typeof SEMANTIC_COLORS] || 'bg-gray-100 text-gray-800';
};

// Función helper para obtener colores por estado
export const getColorByStatus = (status: string): string => {
  return SEMANTIC_COLORS[status as keyof typeof SEMANTIC_COLORS] || 'bg-gray-100 text-gray-800';
};
