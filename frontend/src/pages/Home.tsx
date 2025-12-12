import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen, Brain, Wind, Zap, Shield, AlertCircle,
    TrendingUp, Clock, Target, Flame, ArrowRight, Sparkles
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useSobrietyStore } from '../store/sobrietyStore';
import { useJournalStore } from '../store/journalStore';
import { PullToRefresh } from '../components/ui/PullToRefresh';
import { SkeletonCard, SkeletonStats } from '../components/ui/Skeleton';

export default function Home() {
    const log = useSobrietyStore((s) => s.log);
    const fetchLog = useSobrietyStore((s) => s.fetchLog);
    const isLoadingLog = useSobrietyStore((s) => s.isLoading);
    const entries = useJournalStore((s) => s.entries);
    const fetchEntries = useJournalStore((s) => s.fetchEntries);
    const isLoadingEntries = useJournalStore((s) => s.isLoading);

    useEffect(() => {
        fetchLog();
        fetchEntries();
    }, [fetchLog, fetchEntries]);

    const daysClean = log?.current_streak || 0;
    const lastEntry = entries[0];
    const lastMood = lastEntry?.mood_rating;
    const isLoading = isLoadingLog || isLoadingEntries;

    return (
        <PullToRefresh onRefresh={async () => {
            await Promise.all([fetchLog(), fetchEntries()]);
        }}>
            <div className="space-y-6 animate-fade-in pb-20">
                {/* Hero Status Card */}
                {isLoading ? (
                    <SkeletonCard className="text-center py-8" />
                ) : (
                    <Card variant="premium" className="text-center py-8 relative overflow-hidden">
                        {/* Decorative gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
                        
                        <div className="relative">
                            <div className="mb-2">
                                <span className="text-7xl font-serif font-bold text-primary animate-counter-pop">
                                    {daysClean}
                                </span>
                            </div>
                            <p className="text-lg text-text-secondary font-medium">
                                {daysClean === 1 ? 'день' : daysClean < 5 ? 'дня' : 'дней'} без игры
                            </p>

                            {daysClean >= 7 && (
                                <div className="mt-4 flex justify-center items-center gap-2 animate-bounce-slow">
                                    <Flame className="w-6 h-6 text-accent fill-accent" />
                                    <span className="text-sm font-medium text-accent">Огонь! Продолжай!</span>
                                </div>
                            )}

                            {daysClean >= 30 && (
                                <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-medium text-primary">Месяц силы!</span>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {/* SOS Button - Always visible */}
                <Link to="/sos" className="block group">
                    <Card 
                        variant="elevated" 
                        className="bg-gradient-to-r from-error to-accent text-white border-none overflow-hidden relative"
                        interactive
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <div className="flex items-center gap-4 relative">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-serif font-bold text-lg">Хочется играть?</h3>
                                <p className="text-white/80 text-sm">Нажми для быстрой помощи</p>
                            </div>
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Card>
                </Link>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 gap-3 stagger-list">
                    <Link to="/journal">
                        <ActionCard
                            icon={<BookOpen className="w-5 h-5" />}
                            title="Дневник"
                            subtitle={lastMood ? `Последнее: ${lastMood}/10` : 'Записать'}
                            gradient="from-primary to-primary-light"
                        />
                    </Link>
                    <Link to="/cbt">
                        <ActionCard
                            icon={<Brain className="w-5 h-5" />}
                            title="КПТ"
                            subtitle="Упражнения"
                            gradient="from-secondary to-secondary-light"
                        />
                    </Link>
                    <Link to="/breathing">
                        <ActionCard
                            icon={<Wind className="w-5 h-5" />}
                            title="Дыхание"
                            subtitle="4-7-8"
                            gradient="from-info to-secondary"
                        />
                    </Link>
                    <Link to="/triggers">
                        <ActionCard
                            icon={<Zap className="w-5 h-5" />}
                            title="Триггеры"
                            subtitle="Что провоцирует"
                            gradient="from-accent to-accent-light"
                        />
                    </Link>
                </div>

                {/* Today's Goal */}
                <Card variant="outlined" className="border-l-4 border-l-primary">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-serif font-bold">Цель на сегодня</h4>
                            <p className="text-text-secondary text-sm">
                                Не играть. Записать мысли. Дышать при желании.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Quick Stats */}
                {isLoading ? (
                    <SkeletonStats count={3} />
                ) : (
                    <div className="grid grid-cols-3 gap-3 text-center stagger-list">
                        <StatCard
                            icon={<Clock className="w-4 h-4" />}
                            value={entries.length}
                            label="записей"
                            color="text-primary"
                        />
                        <StatCard
                            icon={<Shield className="w-4 h-4" />}
                            value={daysClean}
                            label="дней"
                            color="text-secondary"
                        />
                        <StatCard
                            icon={<TrendingUp className="w-4 h-4" />}
                            value={lastMood || '—'}
                            label="настроение"
                            color="text-accent"
                        />
                    </div>
                )}
            </div>
        </PullToRefresh>
    );
}

function ActionCard({ icon, title, subtitle, gradient }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    gradient: string;
}) {
    return (
        <Card variant="elevated" interactive className="group">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm">{title}</h4>
                    <p className="text-xs text-text-secondary truncate">{subtitle}</p>
                </div>
            </div>
        </Card>
    );
}

function StatCard({ icon, value, label, color }: {
    icon: React.ReactNode;
    value: number | string;
    label: string;
    color: string;
}) {
    return (
        <Card variant="gradient" className="p-3">
            <div className="text-text-muted mb-1 flex justify-center">{icon}</div>
            <div className={`text-xl font-serif font-bold ${color}`}>{value}</div>
            <div className="text-xs text-text-secondary">{label}</div>
        </Card>
    );
}
