"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  MapPin, 
  GraduationCap, 
  Briefcase,
  BarChart3,
  PieChart,
  TrendingUp
} from "lucide-react";

interface DemographicsChartProps {
  data: {
    usersByAge: Array<{ ageGroup: string; count: number }>;
    usersByLocation: Array<{ location: string; count: number }>;
    usersByEducation: Array<{ education: string; count: number }>;
    usersByExperience: Array<{ experience: string; count: number }>;
  };
}

export function DemographicsChart({ data }: DemographicsChartProps) {
  const totalUsers = data.usersByAge.reduce((sum, group) => sum + group.count, 0);

  const ageColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500'
  ];

  const educationColors = [
    'bg-indigo-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500'
  ];

  const experienceColors = [
    'bg-gray-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500'
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Age */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Usuarios por Edad
            </CardTitle>
            <CardDescription>
              Distribución de usuarios por grupos de edad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.usersByAge.map((ageGroup, index) => {
                const percentage = (ageGroup.count / totalUsers) * 100;
                const color = ageColors[index % ageColors.length];
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${color}`}></div>
                      <span className="font-medium">{ageGroup.ageGroup}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${color}`}
                          style={{ width: `${percentage}%` } as React.CSSProperties}
                        ></div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{ageGroup.count}</div>
                        <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Users by Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Usuarios por Ubicación
            </CardTitle>
            <CardDescription>
              Distribución geográfica de usuarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.usersByLocation.slice(0, 10).map((location, index) => {
                const percentage = (location.count / totalUsers) * 100;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <span className="font-medium truncate">{location.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` } as React.CSSProperties}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8 text-right">
                        {location.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Education */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2" />
              Usuarios por Educación
            </CardTitle>
            <CardDescription>
              Nivel educativo de los usuarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.usersByEducation.map((education, index) => {
                const percentage = (education.count / totalUsers) * 100;
                const color = educationColors[index % educationColors.length];
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${color}`}></div>
                      <span className="font-medium">{education.education}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${color}`}
                          style={{ width: `${percentage}%` } as React.CSSProperties}
                        ></div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{education.count}</div>
                        <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Users by Experience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2" />
              Usuarios por Experiencia
            </CardTitle>
            <CardDescription>
              Años de experiencia profesional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.usersByExperience.map((experience, index) => {
                const percentage = (experience.count / totalUsers) * 100;
                const color = experienceColors[index % experienceColors.length];
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${color}`}></div>
                      <span className="font-medium">{experience.experience}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${color}`}
                          style={{ width: `${percentage}%` } as React.CSSProperties}
                        ></div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{experience.count}</div>
                        <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demographics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Resumen Demográfico
          </CardTitle>
          <CardDescription>
            Estadísticas clave de la base de usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {totalUsers.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                Total de Usuarios
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {data.usersByAge.find(g => g.ageGroup === '25-34')?.count || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Usuarios 25-34 años
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {data.usersByEducation.find(e => e.education === 'Bachelor\'s')?.count || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Con Licenciatura
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {data.usersByExperience.find(e => e.experience === '3-5 years')?.count || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                3-5 años experiencia
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
