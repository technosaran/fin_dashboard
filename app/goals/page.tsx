"use client";

import { useState } from 'react';
import { useFinance, Goal } from '../components/FinanceContext';
import {
    Target,
    Plus,
    X,
    TrendingUp,
    Calendar,
    ChevronRight,
    Trophy,
    ArrowUpRight,
    Search,
    Filter,
    MoreHorizontal,
    Trash2,
    Edit3,
    AlertCircle,
    CheckCircle2,
    Clock,
    Flame
} from 'lucide-react';

export default function GoalsPage() {
    const { goals, addGoal, updateGoal, deleteGoal } = useFinance();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentAmount, setCurrentAmount] = useState('');
    const [deadline, setDeadline] = useState('');
    const [category, setCategory] = useState('Savings');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !targetAmount) return;

        const goalData = {
            name,
            targetAmount: parseFloat(targetAmount),
            currentAmount: parseFloat(currentAmount) || 0,
            deadline,
            category,
            description
        };

        if (editId) {
            updateGoal({ ...goalData, id: editId });
        } else {
            addGoal(goalData);
        }

        resetForm();
        setIsModalOpen(false);
    };

    const resetForm = () => {
        setEditId(null);
        setName('');
        setTargetAmount('');
        setCurrentAmount('');
        setDeadline('');
        setCategory('Savings');
        setDescription('');
    };

    const handleEdit = (goal: Goal) => {
        setEditId(goal.id);
        setName(goal.name);
        setTargetAmount(goal.targetAmount.toString());
        setCurrentAmount(goal.currentAmount.toString());
        setDeadline(goal.deadline || '');
        setCategory(goal.category);
        setDescription(goal.description || '');
        setIsModalOpen(true);
    };

    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

    return (
        <div className="main-content" style={{ padding: '40px 60px', backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>Target Milestones</h1>
                        <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '8px' }}>Engineered for ambitious wealth accumulation</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        style={{
                            padding: '14px 28px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: '800',
                            fontSize: '0.9rem',
                            boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <Plus size={18} strokeWidth={3} /> New Directive
                    </button>
                </div>

                {/* Achievement Statistics */}
                <div style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    padding: '40px',
                    borderRadius: '32px',
                    border: '1px solid #1e293b',
                    marginBottom: '48px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '60px', alignItems: 'center' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <div style={{ background: 'rgba(52, 211, 153, 0.1)', padding: '10px', borderRadius: '12px', color: '#34d399' }}>
                                    <Trophy size={24} />
                                </div>
                                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '2px' }}>Aggregate Success</span>
                            </div>
                            <h2 style={{ fontSize: '3.5rem', fontWeight: '950', color: '#fff', margin: '0 0 24px 0', letterSpacing: '-2.5px' }}>
                                {overallProgress.toFixed(1)}% <span style={{ color: '#475569', fontSize: '1.5rem', fontWeight: '700', letterSpacing: '0' }}>Realized</span>
                            </h2>
                            <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', overflow: 'hidden' }}>
                                <div style={{ width: `${overallProgress}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1 0%, #34d399 100%)', borderRadius: '100px', transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                            <div style={{ textAlign: 'left', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                <div style={{ color: '#475569', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Accumulated</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#34d399' }}>₹{totalCurrent.toLocaleString()}</div>
                            </div>
                            <div style={{ textAlign: 'left', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                <div style={{ color: '#475569', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>Global Target</div>
                                <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>₹{totalTarget.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Goals Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '32px' }}>
                    {goals.length > 0 ? (
                        goals.map(goal => {
                            const progress = (goal.currentAmount / goal.targetAmount) * 100;
                            const isCompleted = progress >= 100;

                            return (
                                <div key={goal.id} style={{
                                    background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
                                    borderRadius: '32px',
                                    border: '1px solid #1e293b',
                                    padding: '32px',
                                    transition: 'all 0.3s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '24px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-8px)';
                                        e.currentTarget.style.borderColor = '#334155';
                                        e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = '#1e293b';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ background: isCompleted ? 'rgba(52, 211, 153, 0.1)' : 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '16px', color: isCompleted ? '#34d399' : '#818cf8', display: 'flex' }}>
                                                {isCompleted ? <CheckCircle2 size={24} /> : <Flame size={24} />}
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#fff' }}>{goal.name}</h3>
                                                <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>{goal.category}</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleEdit(goal)} style={{ background: 'rgba(255,255,255,0.03)', border: 'none', color: '#64748b', cursor: 'pointer', padding: '10px', borderRadius: '12px' }}><Edit3 size={16} /></button>
                                            <button onClick={() => deleteGoal(goal.id)} style={{ background: 'rgba(244, 63, 94, 0.1)', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '10px', borderRadius: '12px' }}><Trash2 size={16} /></button>
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#475569', fontWeight: '800', textTransform: 'uppercase' }}>Directive Progress</span>
                                            <span style={{ color: isCompleted ? '#34d399' : '#fff', fontWeight: '900' }}>{progress.toFixed(0)}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '10px', background: '#020617', borderRadius: '100px', overflow: 'hidden' }}>
                                            <div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: isCompleted ? '#34d399' : '#6366f1', borderRadius: '100px', transition: 'width 1s ease' }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '24px', background: 'rgba(2, 6, 23, 0.3)', borderRadius: '20px' }}>
                                        <div>
                                            <div style={{ color: '#475569', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Target</div>
                                            <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '900' }}>₹{goal.targetAmount.toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#475569', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Secured</div>
                                            <div style={{ color: '#34d399', fontSize: '1.2rem', fontWeight: '900' }}>₹{goal.currentAmount.toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '0.8rem', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                                        <Clock size={16} />
                                        <span style={{ fontWeight: '700' }}>Deadline: {goal.deadline ? new Date(goal.deadline).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Continuous Directive'}</span>
                                    </div>

                                    {isCompleted && (
                                        <div style={{ position: 'absolute', top: '25px', right: '-45px', background: '#34d399', color: '#020617', padding: '8px 50px', transform: 'rotate(45deg)', fontSize: '0.75rem', fontWeight: '950', letterSpacing: '2px', boxShadow: '0 5px 15px rgba(52, 211, 153, 0.3)' }}>MISSION COMPLETE</div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ gridColumn: '1 / -1', padding: '100px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.2)', borderRadius: '40px', border: '2px dashed #1e293b', color: '#475569' }}>
                            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
                                <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '40px', borderRadius: '50%' }}>
                                    <Target size={80} strokeWidth={1} style={{ opacity: 0.2, color: '#6366f1' }} />
                                </div>
                            </div>
                            <h3 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '800', marginBottom: '12px' }}>Operational Void In Goals</h3>
                            <p style={{ margin: 0, fontSize: '1rem', color: '#64748b' }}>Initialize your first wealth directive to begin accumulation tracking.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal - FINCORE Standard */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#0f172a', padding: '40px', borderRadius: '32px', border: '1px solid #334155', width: '100%', maxWidth: '550px', boxShadow: '0 50px 100px rgba(0,0,0,0.7)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: 0 }}>{editId ? 'Modify Directive' : 'New Directive'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>Directive Title</label>
                                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sovereign Wealth Fund" style={{ background: '#020617', border: '1px solid #1e293b', padding: '18px', borderRadius: '18px', color: '#fff', fontSize: '1.1rem', outline: 'none' }} autoFocus />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>Target Capital (₹)</label>
                                    <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="0.00" style={{ background: '#020617', border: '1px solid #1e293b', padding: '18px', borderRadius: '18px', color: '#fff', fontSize: '1.1rem', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>Initial Seed (₹)</label>
                                    <input type="number" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} placeholder="0.00" style={{ background: '#020617', border: '1px solid #1e293b', padding: '18px', borderRadius: '18px', color: '#fff', fontSize: '1.1rem', outline: 'none' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>Target Date</label>
                                    <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ background: '#020617', border: '1px solid #1e293b', padding: '18px', borderRadius: '18px', color: '#fff', fontSize: '1.1rem', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>Classification</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)} style={{ background: '#020617', border: '1px solid #1e293b', padding: '18px', borderRadius: '18px', color: '#fff', fontSize: '1.1rem', outline: 'none', cursor: 'pointer' }}>
                                        <option value="Savings">Strategic Savings</option>
                                        <option value="Investment">Growth Assets</option>
                                        <option value="Emergency">Reserve Fund</option>
                                        <option value="Travel">Exploration</option>
                                        <option value="Purchase">Capital Acquisition</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" style={{ marginTop: '12px', background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: '#fff', padding: '20px', borderRadius: '20px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 15px 30px rgba(99, 102, 241, 0.4)' }}>{editId ? 'Commit Changes' : 'Execute Directive'}</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
