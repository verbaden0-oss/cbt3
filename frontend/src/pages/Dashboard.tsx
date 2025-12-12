import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useJournalStore } from '../store/journalStore';
import { useTriggersStore } from '../store/triggersStore';
import { useSobrietyStore } from '../store/sobrietyStore';
import { useCBTStore } from '../store/cbtStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SkeletonStats, SkeletonChart, SkeletonCard } from '../components/ui/Skeleton';
import { 
    Smile, 
    Meh, 
    Frown, 
    Sad,
    BookOpen,
    Brain,
    Shield,
    Zap,
    Lightbulb,
    TrendingUp,
    TrendingDown,
    Minus
} from 'lucide-react';

export default function Dashboard() {
    const entries = useJournalStore((s) => s.entries);
    const fetchEntries = useJournalStore((s) => s.fetchEntries);
    const isLoadingEntries = useJournalStore((s) => s.isLoading);
    const triggers = useTriggersStore((s) => s.triggers);
    const fetchTriggers = useTriggersStore((s) => s.fetchTriggers);
    const log = useSobrietyStore((s) => s.log);
    const fetchLog = useSobrietyStore((s) => s.fetchLog);
    const exercises = useCBTStore((s) => s.exercises);
    const fetchExercises = useCBTStore((s) => s.fetchExercises);

    useEffect(() => {
        fetchEntries();
        fetchTriggers();
        fetchLog();
        fetchExercises();
    }, [fetchEntries, fetchTriggers, fetchLog, fetchExercises]);

    // Calculate mood statistics for last 7 days
    const moodStats = useMemo(() => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const recentEntries = entries.filter(e => new Date(e.date) >= weekAgo);

        if (recentEntries.length === 0) return null;

        const avgMood = recentEntries.reduce((sum, e) => sum + e.mood_rating, 0) / recentEntries.length;
        const maxMood = Math.max(...recentEntries.map(e => e.mood_rating));
        const minMood = Math.min(...recentEntries.map(e => e.mood_rating));

        // Daily breakdown for chart
        const dailyMoods: { date: string; avg: number; count: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dayStr = date.toISOString().split('T')[0];
            const dayEntries = recentEntries.filter(e => e.date.split('T')[0] === dayStr);
            dailyMoods.push({
                date: dayStr,
                avg: dayEntries.length > 0 ? dayEntries.reduce((s, e) => s + e.mood_rating, 0) / dayEntries.length : 0,
                count: dayEntries.length
            });
        }

        // Calculate trend
        const firstHalf = dailyMoods.slice(0, 3).filter(d => d.count > 0);
        const secondHalf = dailyMoods.slice(4).filter(d => d.count > 0);
        const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((s, d) => s + d.avg, 0) / firstHalf.length : 0;
        const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((s, d) => s + d.avg, 0) / secondHalf.length : 0;
        const trend = secondAvg - firstAvg;

        return { avgMood, maxMood, minMood, dailyMoods, totalEntries: recentEntries.length, trend };
    }, [entries]);

    // Calculate trigger frequency
    const triggerStats = useMemo(() => {
        const now = new Date();
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const recentEntries = entries.filter(e => new Date(e.date) >= monthAgo);

        const triggerCounts: Record<number, { name: string; count: number; avgMood: number }> = {};

        recentEntries.forEach(entry => {
            if (entry.trigger_ids) {
                entry.trigger_ids.forEach(tid => {
                    const trigger = triggers.find(t => t.id === tid);
                    if (trigger) {
                        if (!triggerCounts[tid]) {
                            triggerCounts[tid] = { name: trigger.name, count: 0, avgMood: 0 };
                        }
                        triggerCounts[tid].count++;
                        triggerCounts[tid].avgMood += entry.mood_rating;
                    }
                });
            }
        });

        Object.values(triggerCounts).forEach(tc => {
            tc.avgMood = tc.avgMood / tc.count;
        });

        return Object.values(triggerCounts).sort((a, b) => b.count - a.count).slice(0, 5);
    }, [entries, triggers]);

    const getMoodIcon = (mood: number) => {
        if (mood >= 8) return <Smile className="w-4 h-4 inline" />;
        if (mood >= 6) return <Meh className="w-4 h-4 inline" />;
        if (mood >= 4) return <Frown className="w-4 h-4 inline" />;
        return <Sad className="w-4 h-4 inline" />;
    };

    const getMoodColor = (mood: number) => {
        if (mood >= 7) return 'text-success';
        if (mood >= 4) return 'text-warning';
        return 'text-error';
    };

    const getBarClass = (mood: number) => {
        if (mood >= 7) return 'chart-bar-positive';
        if (mood >= 4) return 'chart-bar-neutral';
        return 'chart-bar-negative';
    };

    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-serif font-bold text-text-primary">
                    Моя Статистика
                </h1>
                <p className="text-text-secondary">
                    Отслеживай прогресс и находи закономерности
                </p>
            </div>

            {/* Quick Stats */}
            {isLoadingEntries ? (
                <SkeletonStats count={4} />
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-list">
                    <StatCard
                        value={log?.current_streak || 0}
                        label="Дней трезвости"
                        icon={<Shield className="w-5 h-5" />}
                        color="primary"
                    />
                    <StatCard
                        value={entries.length}
                        label="Записей в дневнике"
                        icon={<BookOpen className="w-5 h-5" />}
                        color="secondary"
                    />
                    <StatCard
                        value={exercises.length}
                        label="КПТ упражнений"
                        icon={<Brain className="w-5 h-5" />}
                        color="accent"
                    />
                    <StatCard
                        value={triggers.length}
                        label="Триггеров"
                        icon={<Zap className="w-5 h-5" />}
                        color="warning"
                    />
                </div>
            )}

            {/* Mood Chart */}
            <Card variant="elevated">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-serif font-bold">Настроение за неделю</h2>
                    {moodStats && moodStats.trend !== 0 && (
                        <div className={`flex items-center gap-1 text-sm font-medium ${
                            moodStats.trend > 0 ? 'text-success' : moodStats.trend < 0 ? 'text-error' : 'text-text-secondary'
                        }`}>
                            {moodStats.trend > 0 ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : moodStats.trend < 0 ? (
                                <TrendingDown className="w-4 h-4" />
                            ) : (
                                <Minus className="w-4 h-4" />
                            )}
                            <span>{moodStats.trend > 0 ? '+' : ''}{moodStats.trend.toFixed(1)}</span>
                        </div>
                    )}
                </div>
                
                {isLoadingEntries ? (
                    <SkeletonChart bars={7} />
                ) : moodStats ? (
                    <>
                        <div className="flex items-end justify-between h-40 mb-4 gap-2">
                            {moodStats.dailyMoods.map((day, idx) => {
                                const date = new Date(day.date);
                                const dayName = dayNames[date.getDay()];
                                const height = day.avg > 0 ? (day.avg / 10) * 100 : 0;

                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center group">
                                        <div className="w-full flex flex-col items-center justify-end h-32 relative">
                                            {day.count > 0 && (
                                                <span className="text-xs font-medium mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {day.avg.toFixed(1)}
                                                </span>
                                            )}
                                            <div
                                                className={`w-full max-w-10 chart-bar ${getBarClass(day.avg)} transition-all duration-500 group-hover:scale-105`}
                                                style={{ 
                                                    height: `${height}%`, 
                                                    minHeight: day.count > 0 ? '10px' : '0',
                                                    animationDelay: `${idx * 0.1}s`
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-text-muted mt-2 font-medium">{dayName}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between text-sm text-text-secondary border-t border-border pt-4">
                            <span className="flex items-center gap-2">
                                Среднее: 
                                <strong className={getMoodColor(moodStats.avgMood)}>
                                    {moodStats.avgMood.toFixed(1)}
                                </strong> 
                                {getMoodIcon(moodStats.avgMood)}
                            </span>
                            <span>Записей: <strong>{moodStats.totalEntries}</strong></span>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8 text-text-secondary">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-elevated flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-text-muted" />
                        </div>
                        <p className="mb-4">Нет данных за последнюю неделю</p>
                        <Link to="/journal">
                            <Button>Начать вести дневник</Button>
                        </Link>
                    </div>
                )}
            </Card>

            {/* Trigger Correlation */}
            <Card variant="elevated">
                <h2 className="text-xl font-serif font-bold mb-4">Топ триггеров (за месяц)</h2>
                {isLoadingEntries ? (
                    <div className="space-y-3">
                        {[1,2,3].map(i => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : triggerStats.length > 0 ? (
                    <div className="space-y-3 stagger-list">
                        {triggerStats.map((ts, idx) => (
                            <div 
                                key={idx} 
                                className="flex items-center justify-between p-3 rounded-xl bg-surface-elevated hover:bg-border/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                        {idx + 1}
                                    </span>
                                    <span className="font-medium">{ts.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-text-secondary">
                                        {ts.count}×
                                    </span>
                                    <span className={`text-sm font-bold flex items-center gap-1 ${getMoodColor(ts.avgMood)}`}>
                                        ø {ts.avgMood.toFixed(1)} {getMoodIcon(ts.avgMood)}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-accent/10 text-accent">
                            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p className="text-xs">
                                Триггеры с низким средним настроением — зоны внимания для КПТ работы
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 text-text-secondary">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-elevated flex items-center justify-center">
                            <Zap className="w-8 h-8 text-text-muted" />
                        </div>
                        <p className="mb-4">Нет данных о связи триггеров и настроения</p>
                        <Link to="/triggers">
                            <Button variant="secondary">Добавить триггеры</Button>
                        </Link>
                    </div>
                )}
            </Card>

            {/* Quick Actions */}
            <Card variant="gradient">
                <h2 className="text-xl font-serif font-bold mb-4">Быстрые действия</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link to="/journal">
                        <Button variant="outline" fullWidth className="flex items-center justify-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Дневник
                        </Button>
                    </Link>
                    <Link to="/cbt">
                        <Button variant="outline" fullWidth className="flex items-center justify-center gap-2">
                            <Brain className="w-4 h-4" />
                            КПТ
                        </Button>
                    </Link>
                    <Link to="/sobriety">
                        <Button variant="outline" fullWidth className="flex items-center justify-center gap-2">
                            <Shield className="w-4 h-4" />
                            Трезвость
                        </Button>
                    </Link>
                    <Link to="/triggers">
                        <Button variant="outline" fullWidth className="flex items-center justify-center gap-2">
                            <Zap className="w-4 h-4" />
                            Триггеры
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}

function StatCard({ value, label, icon, color }: {
    value: number;
    label: string;
    icon: React.ReactNode;
    color: 'primary' | 'secondary' | 'accent' | 'warning';
}) {
    const colorClasses = {
        primary: 'text-primary bg-primary/10',
        secondary: 'text-secondary bg-secondary/10',
        accent: 'text-accent bg-accent/10',
        warning: 'text-warning bg-warning/10',
    };

    return (
        <Card variant="spotlight" className="text-center group">
            <div className={`w-10 h-10 mx-auto mb-2 rounded-xl ${colorClasses[color]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div className={`text-3xl font-serif font-bold ${colorClasses[color].split(' ')[0]}`}>
                {value}
            </div>
            <div className="text-sm text-text-secondary">{label}</div>
        </Card>
    );
}
