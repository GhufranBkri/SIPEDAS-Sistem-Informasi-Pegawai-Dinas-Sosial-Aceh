// src/pages/Struktur.js
// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import './Tree.css';

const Struktur = () => {
    return (
        <div className="min-h-screen">
            <main className="py-8">
                <div className="mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                        <h1 className="text-2xl font-bold">Struktur</h1>
                        <div className="tree">

                            <ul>
                                <li>
                                    <div>
                                        Main
                                    </div>
                                    <ul>
                                        <li>
                                            <div>gaga</div>
                                        </li>
                                        <li>
                                            <div>haha</div>
                                            <ul>
                                                <li>
                                                    <div>fafa</div>
                                                    <ul>
                                                        <li>
                                                            <div>dada</div>
                                                        </li>
                                                    </ul>
                                                </li>
                                                <li>
                                                    <div>sasa</div>
                                                    <ul>
                                                        <li>
                                                            <div>jaja</div>
                                                        </li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Struktur;
