export interface PostEngagementMetrics {
  postId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  engagementLevel: 'low' | 'medium' | 'high' | 'excellent';
  timeToFirstInteraction: number; // minutes
  peakEngagementTime: string; // hour of day
  averageEngagementPerHour: number;
  totalReach: number;
  viralityScore: number; // 0-100
}

export interface PostPerformanceComparison {
  currentPost: PostEngagementMetrics;
  previousPost?: PostEngagementMetrics;
  improvement: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
  };
  trend: 'up' | 'down' | 'stable';
}

export interface EngagementRecommendation {
  type: 'content' | 'timing' | 'hashtags' | 'interaction' | 'format';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  action: string;
}

export class PostEngagementService {
  static calculateEngagementRate(views: number, likes: number, comments: number, shares: number): number {
    const totalEngagement = likes + comments + shares;
    return views > 0 ? (totalEngagement / views) * 100 : 0;
  }

  static getEngagementLevel(engagementRate: number): 'low' | 'medium' | 'high' | 'excellent' {
    if (engagementRate >= 10) return 'excellent';
    if (engagementRate >= 5) return 'high';
    if (engagementRate >= 2) return 'medium';
    return 'low';
  }

  static calculateViralityScore(views: number, shares: number, comments: number, likes: number): number {
    const shareRate = views > 0 ? (shares / views) * 100 : 0;
    const commentRate = views > 0 ? (comments / views) * 100 : 0;
    const likeRate = views > 0 ? (likes / views) * 100 : 0;
    
    // Weighted virality score
    const viralityScore = (shareRate * 0.5) + (commentRate * 0.3) + (likeRate * 0.2);
    return Math.min(viralityScore, 100);
  }

  static calculateTimeToFirstInteraction(
    createdAt: Date,
    firstLikeTime?: Date,
    firstCommentTime?: Date,
    firstShareTime?: Date
  ): number {
    const times = [firstLikeTime, firstCommentTime, firstShareTime].filter(Boolean) as Date[];
    
    if (times.length === 0) return 0;
    
    const firstInteraction = new Date(Math.min(...times.map(t => t.getTime())));
    const diffInMs = firstInteraction.getTime() - createdAt.getTime();
    return Math.round(diffInMs / (1000 * 60)); // minutes
  }

  static calculateAverageEngagementPerHour(
    totalEngagement: number,
    createdAt: Date,
    currentTime: Date = new Date()
  ): number {
    const hoursElapsed = (currentTime.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursElapsed > 0 ? totalEngagement / hoursElapsed : 0;
  }

  static getPeakEngagementTime(interactions: Array<{ timestamp: Date; type: 'like' | 'comment' | 'share' }>): string {
    if (interactions.length === 0) return 'N/A';
    
    const hourCounts = new Array(24).fill(0);
    
    interactions.forEach(interaction => {
      const hour = interaction.timestamp.getHours();
      hourCounts[hour]++;
    });
    
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    return `${peakHour}:00`;
  }

  static generateRecommendations(metrics: PostEngagementMetrics): EngagementRecommendation[] {
    const recommendations: EngagementRecommendation[] = [];
    
    // Low engagement recommendations
    if (metrics.engagementLevel === 'low') {
      recommendations.push({
        type: 'content',
        priority: 'high',
        title: 'Mejora el contenido',
        description: 'Tu post tiene bajo engagement. Considera hacer el contenido más atractivo.',
        action: 'Agrega imágenes, haz preguntas, o comparte experiencias personales'
      });
      
      recommendations.push({
        type: 'hashtags',
        priority: 'medium',
        title: 'Optimiza los hashtags',
        description: 'Usa hashtags relevantes para aumentar la visibilidad.',
        action: 'Agrega 3-5 hashtags populares relacionados con tu contenido'
      });
    }
    
    // No comments recommendations
    if (metrics.comments === 0) {
      recommendations.push({
        type: 'interaction',
        priority: 'high',
        title: 'Genera comentarios',
        description: 'No hay comentarios en tu post. Haz preguntas para fomentar la interacción.',
        action: 'Termina tu post con una pregunta abierta o pide opiniones'
      });
    }
    
    // No shares recommendations
    if (metrics.shares === 0) {
      recommendations.push({
        type: 'content',
        priority: 'medium',
        title: 'Crea contenido compartible',
        description: 'Tu contenido no se está compartiendo. Haz algo más valioso o inspirador.',
        action: 'Comparte consejos útiles, experiencias inspiradoras o contenido educativo'
      });
    }
    
    // High engagement recommendations
    if (metrics.engagementLevel === 'excellent') {
      recommendations.push({
        type: 'content',
        priority: 'low',
        title: 'Mantén el momentum',
        description: '¡Excelente engagement! Continúa creando contenido similar.',
        action: 'Analiza qué funcionó bien y repite esos elementos en futuros posts'
      });
    }
    
    // Timing recommendations
    if (metrics.averageEngagementPerHour < 1) {
      recommendations.push({
        type: 'timing',
        priority: 'medium',
        title: 'Optimiza el horario',
        description: 'Tu post no está generando mucha interacción por hora.',
        action: 'Publica cuando tu audiencia esté más activa (típicamente 7-9 AM o 6-8 PM)'
      });
    }
    
    // Format recommendations
    if (metrics.views > 0 && metrics.engagementRate < 3) {
      recommendations.push({
        type: 'format',
        priority: 'medium',
        title: 'Mejora el formato',
        description: 'Considera cambiar el formato de tu contenido.',
        action: 'Prueba con videos, imágenes, o posts más cortos y directos'
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  static comparePostPerformance(
    currentPost: PostEngagementMetrics,
    previousPost?: PostEngagementMetrics
  ): PostPerformanceComparison {
    if (!previousPost) {
      return {
        currentPost,
        improvement: {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          engagementRate: 0
        },
        trend: 'stable'
      };
    }
    
    const improvement = {
      views: ((currentPost.views - previousPost.views) / Math.max(previousPost.views, 1)) * 100,
      likes: ((currentPost.likes - previousPost.likes) / Math.max(previousPost.likes, 1)) * 100,
      comments: ((currentPost.comments - previousPost.comments) / Math.max(previousPost.comments, 1)) * 100,
      shares: ((currentPost.shares - previousPost.shares) / Math.max(previousPost.shares, 1)) * 100,
      engagementRate: currentPost.engagementRate - previousPost.engagementRate
    };
    
    const avgImprovement = (improvement.views + improvement.likes + improvement.comments + improvement.shares) / 4;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (avgImprovement > 10) trend = 'up';
    else if (avgImprovement < -10) trend = 'down';
    
    return {
      currentPost,
      previousPost,
      improvement,
      trend
    };
  }

  static generateEngagementReport(metrics: PostEngagementMetrics): string {
    const { engagementLevel, engagementRate, viralityScore, totalReach } = metrics;
    
    let report = `📊 Reporte de Engagement\n\n`;
    report += `🎯 Nivel de Engagement: ${engagementLevel.toUpperCase()}\n`;
    report += `📈 Tasa de Engagement: ${engagementRate.toFixed(1)}%\n`;
    report += `🔥 Puntuación de Viralidad: ${viralityScore.toFixed(1)}/100\n`;
    report += `👥 Alcance Total: ${totalReach} personas\n\n`;
    
    if (engagementLevel === 'excellent') {
      report += `🎉 ¡Excelente trabajo! Tu contenido está resonando muy bien con la audiencia.\n`;
    } else if (engagementLevel === 'high') {
      report += `👍 Buen rendimiento. Tu contenido está generando buena interacción.\n`;
    } else if (engagementLevel === 'medium') {
      report += `📝 Rendimiento promedio. Hay espacio para mejorar la interacción.\n`;
    } else {
      report += `💡 Tu contenido necesita más engagement. Considera los consejos de mejora.\n`;
    }
    
    return report;
  }
}
