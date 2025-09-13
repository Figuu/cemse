"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  X, 
  Star, 
  Target, 
  TrendingUp,
  CheckCircle,
  Award
} from "lucide-react";

interface Skill {
  id: string;
  name: string;
  level: number; // 1-5
  category: string;
  verified: boolean;
}

interface SkillsAssessmentProps {
  className?: string;
}

const skillCategories = [
  "Tecnología",
  "Diseño",
  "Marketing",
  "Ventas",
  "Gestión",
  "Comunicación",
  "Idiomas",
  "Otros"
];

const suggestedSkills = [
  { name: "JavaScript", category: "Tecnología" },
  { name: "React", category: "Tecnología" },
  { name: "Node.js", category: "Tecnología" },
  { name: "Python", category: "Tecnología" },
  { name: "Figma", category: "Diseño" },
  { name: "Photoshop", category: "Diseño" },
  { name: "Marketing Digital", category: "Marketing" },
  { name: "SEO", category: "Marketing" },
  { name: "Ventas", category: "Ventas" },
  { name: "Gestión de Proyectos", category: "Gestión" },
  { name: "Comunicación", category: "Comunicación" },
  { name: "Inglés", category: "Idiomas" },
  { name: "Español", category: "Idiomas" },
];

export function SkillsAssessment({ className }: SkillsAssessmentProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const addSkill = () => {
    if (newSkill.trim() && selectedCategory) {
      const skill: Skill = {
        id: Date.now().toString(),
        name: newSkill.trim(),
        level: 1,
        category: selectedCategory,
        verified: false,
      };
      setSkills([...skills, skill]);
      setNewSkill("");
      setSelectedCategory("");
      setShowAddForm(false);
    }
  };

  const addSuggestedSkill = (skillName: string, category: string) => {
    const skill: Skill = {
      id: Date.now().toString(),
      name: skillName,
      level: 1,
      category,
      verified: false,
    };
    setSkills([...skills, skill]);
  };

  const updateSkillLevel = (id: string, level: number) => {
    setSkills(skills.map(skill => 
      skill.id === id ? { ...skill, level } : skill
    ));
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const getLevelColor = (level: number) => {
    if (level >= 4) return "text-green-600";
    if (level >= 3) return "text-blue-600";
    if (level >= 2) return "text-yellow-600";
    return "text-red-600";
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 1: return "Principiante";
      case 2: return "Básico";
      case 3: return "Intermedio";
      case 4: return "Avanzado";
      case 5: return "Experto";
      default: return "Principiante";
    }
  };

  const getCategorySkills = (category: string) => {
    return skills.filter(skill => skill.category === category);
  };

  const getTotalSkills = () => skills.length;
  const getVerifiedSkills = () => skills.filter(skill => skill.verified).length;
  const getAverageLevel = () => {
    if (skills.length === 0) return 0;
    return Math.round(skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length * 10) / 10;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Skills Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Habilidades
                </p>
                <p className="text-2xl font-bold">{getTotalSkills()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Verificadas
                </p>
                <p className="text-2xl font-bold">{getVerifiedSkills()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Nivel Promedio
                </p>
                <p className="text-2xl font-bold">{getAverageLevel()}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Skill */}
      <Card>
        <CardHeader>
          <CardTitle>Agregar Nueva Habilidad</CardTitle>
          <CardDescription>
            Añade habilidades que poseas y califica tu nivel de competencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showAddForm ? (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Habilidad
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Nombre de la habilidad</label>
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Ej: JavaScript, Photoshop, Marketing Digital..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Categoría</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="">Selecciona categoría</option>
                    {skillCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={addSkill} disabled={!newSkill.trim() || !selectedCategory}>
                  Agregar
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Habilidades Sugeridas</CardTitle>
          <CardDescription>
            Haz clic en una habilidad para agregarla a tu perfil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {suggestedSkills.map((skill, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                onClick={() => addSuggestedSkill(skill.name, skill.category)}
              >
                <Plus className="h-3 w-3 mr-1" />
                {skill.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills by Category */}
      {skills.length > 0 && (
        <div className="space-y-6">
          {skillCategories.map(category => {
            const categorySkills = getCategorySkills(category);
            if (categorySkills.length === 0) return null;

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categorySkills.map(skill => (
                      <div key={skill.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{skill.name}</h4>
                            {skill.verified && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getLevelLabel(skill.level)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map(level => (
                              <button
                                key={level}
                                onClick={() => updateSkillLevel(skill.id, level)}
                                className={`text-lg ${level <= skill.level ? getLevelColor(skill.level) : 'text-gray-300'}`}
                              >
                                <Star className="h-4 w-4 fill-current" />
                              </button>
                            ))}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSkill(skill.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {skills.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay habilidades agregadas
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza agregando algunas habilidades para mostrar tus competencias.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
