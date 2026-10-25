'use client';
import { useEffect } from 'react';
export function Reveal(){useEffect(()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('reveal-in');observer.unobserve(entry.target);}})},{threshold:.12});document.querySelectorAll('.section h2,.service,.project-heading,.project-picture,.steps li,.principle-sheets article,.about-copy,.contact-body').forEach(el=>observer.observe(el));return()=>observer.disconnect()},[]);return null;}
