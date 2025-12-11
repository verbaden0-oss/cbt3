import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function Home() {
    const features = [
        {
            emoji: '📝',
            title: 'Личный Дневник',
            description: 'Записывай свои мысли и чувства. Отслеживай настроение и находи закономерности.',
            color: 'from-blue-500 to-cyan-400',
        },
        {
            emoji: '🧠',
            title: 'КПТ Упражнения',
            description: 'Работай с негативными мыслями, используя проверенные техники когнитивной терапии.',
            color: 'from-purple-500 to-pink-400',
        },
        {
            emoji: '🛡️',
            title: 'Трекер Трезвости',
            description: 'Следи за прогрессом, отмечай триггеры и празднуй свои победы на пути к свободе.',
            color: 'from-green-500 to-emerald-400',
        },
    ];

    return (
        <div className="relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" />
                <div className="absolute top-40 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
                <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
            </div>

            <div className="space-y-16 animate-fade-in relative z-10">
                {/* Hero Section */}
                <section className="text-center space-y-8 py-16">
                    <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium animate-fade-in">
                        ✨ Бесплатно и приватно
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-secondary">
                            Твой Путь
                        </span>
                        <br />
                        <span className="text-text-primary">к Спокойствию</span>
                    </h1>

                    <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                        Персональный инструмент для когнитивно-поведенческой терапии,
                        ведения дневника и отслеживания трезвости.
                        <strong className="text-text-primary"> Возьми под контроль свое ментальное здоровье.</strong>
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                        <Link to="/journal">
                            <Button size="lg" variant="gradient" className="shadow-xl">
                                🚀 Начать Дневник
                            </Button>
                        </Link>
                        <Link to="/cbt">
                            <Button variant="ghost" size="lg" className="border border-gray-200 dark:border-gray-700">
                                Узнать больше →
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="stagger-fade">
                    <div className="grid md:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                variant="premium"
                                className="space-y-4 group cursor-pointer"
                            >
                                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    {feature.emoji}
                                </div>
                                <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-text-secondary leading-relaxed">
                                    {feature.description}
                                </p>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Stats Section */}
                <section className="text-center py-8">
                    <div className="inline-flex items-center gap-8 px-8 py-4 glass rounded-2xl">
                        <div>
                            <div className="text-3xl font-bold text-primary">100%</div>
                            <div className="text-sm text-text-secondary">Приватно</div>
                        </div>
                        <div className="w-px h-12 bg-gray-200 dark:bg-gray-700" />
                        <div>
                            <div className="text-3xl font-bold text-secondary">24/7</div>
                            <div className="text-sm text-text-secondary">Доступно</div>
                        </div>
                        <div className="w-px h-12 bg-gray-200 dark:bg-gray-700" />
                        <div>
                            <div className="text-3xl font-bold text-accent">∞</div>
                            <div className="text-sm text-text-secondary">Записей</div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
