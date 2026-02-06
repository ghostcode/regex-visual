import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Check, Copy, Info, Terminal } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for class merging
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Cheatsheet Data
const CHEATSHEET = [
  { category: 'Character Classes', items: [
    { code: '.', desc: 'Any character except newline' },
    { code: '\\w', desc: 'Word character [a-zA-Z0-9_]' },
    { code: '\\d', desc: 'Digit [0-9]' },
    { code: '\\s', desc: 'Whitespace' },
    { code: '[abc]', desc: 'Any of a, b, or c' },
    { code: '[^abc]', desc: 'Not a, b, or c' },
    { code: '[a-z]', desc: 'Character between a and z' },
  ]},
  { category: 'Quantifiers', items: [
    { code: '*', desc: '0 or more' },
    { code: '+', desc: '1 or more' },
    { code: '?', desc: '0 or 1' },
    { code: '{n}', desc: 'Exactly n times' },
    { code: '{n,}', desc: 'n or more times' },
    { code: '{n,m}', desc: 'Between n and m times' },
  ]},
  { category: 'Anchors', items: [
    { code: '^', desc: 'Start of string/line' },
    { code: '$', desc: 'End of string/line' },
    { code: '\\b', desc: 'Word boundary' },
  ]},
  { category: 'Groups', items: [
    { code: '(...)', desc: 'Capturing group' },
    { code: '(?:...)', desc: 'Non-capturing group' },
    { code: '(?<name>...)', desc: 'Named capturing group' },
  ]},
];

function App() {
  const [pattern, setPattern] = useState<string>('([A-Z])\\w+');
  const [flags, setFlags] = useState<string>('g');
  const [text, setText] = useState<string>('Hello World! This is a Regex Visualizer.');
  const [matches, setMatches] = useState<RegExpExecArray[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Flags state
  const [flagState, setFlagState] = useState({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
    y: false,
  });

  // Update flags string when flagState changes
  useEffect(() => {
    const newFlags = Object.entries(flagState)
      .filter(([_, enabled]) => enabled)
      .map(([flag]) => flag)
      .join('');
    setFlags(newFlags);
  }, [flagState]);

  // Execute Regex
  useEffect(() => {
    try {
      if (!pattern) {
        setMatches([]);
        setError(null);
        return;
      }

      const regex = new RegExp(pattern, flags);
      const newMatches: RegExpExecArray[] = [];
      
      // Prevent infinite loops with zero-length matches
      let match;
      let loopCheck = 0;
      
      // If global flag is not set, we only get the first match
      if (!flags.includes('g')) {
        match = regex.exec(text);
        if (match) newMatches.push(match);
      } else {
        let lastIndex = 0;
        while ((match = regex.exec(text)) !== null) {
          newMatches.push(match);
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
          if (loopCheck++ > 1000) break; // Safety break
        }
      }

      setMatches(newMatches);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setMatches([]);
    }
  }, [pattern, flags, text]);

  // Highlight matches in text
  const highlightedText = useMemo(() => {
    if (!matches.length) return text;

    let lastIndex = 0;
    const parts = [];

    matches.forEach((match, i) => {
      // Text before match
      if (match.index > lastIndex) {
        parts.push(<span key={`pre-${i}`}>{text.slice(lastIndex, match.index)}</span>);
      }

      // Match
      const matchText = match[0];
      parts.push(
        <span 
          key={`match-${i}`} 
          className="bg-blue-500/30 border-b-2 border-blue-500 text-blue-900 dark:text-blue-100 relative group cursor-pointer"
          title={`Match ${i + 1}`}
        >
          {matchText}
        </span>
      );

      lastIndex = match.index + matchText.length;
    });

    // Remaining text
    if (lastIndex < text.length) {
      parts.push(<span key="end">{text.slice(lastIndex)}</span>);
    }

    return parts;
  }, [text, matches]);

  const toggleFlag = (flag: keyof typeof flagState) => {
    setFlagState(prev => ({ ...prev, [flag]: !prev[flag] }));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center space-x-3 mb-8">
          <div className="p-3 bg-blue-600 rounded-lg shadow-lg">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Regex Visualizer</h1>
            <p className="text-gray-500 text-sm">Build, test, and understand regular expressions</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Regex Input Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Regular Expression</label>
              <div className="flex items-center space-x-2 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                <span className="text-gray-400 font-mono text-lg">/</span>
                <input 
                  type="text" 
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 font-mono text-lg text-gray-800 placeholder-gray-400"
                  placeholder="Enter regex pattern..."
                />
                <span className="text-gray-400 font-mono text-lg">/</span>
                <div className="flex space-x-1">
                  {Object.keys(flagState).map((f) => (
                    <button
                      key={f}
                      onClick={() => toggleFlag(f as keyof typeof flagState)}
                      className={cn(
                        "text-xs font-bold uppercase px-1.5 py-0.5 rounded transition-colors",
                        flagState[f as keyof typeof flagState] 
                          ? "bg-blue-100 text-blue-700" 
                          : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      )}
                      title={`Toggle ${f} flag`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              
              {error && (
                <div className="mt-3 flex items-start space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Test String Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Test String</label>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-32 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-y"
                placeholder="Enter text to test matches against..."
              />
            </div>

            {/* Results / Visualization */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">Match Result</label>
                <div className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                  {matches.length} matches found
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap break-all leading-relaxed min-h-[100px]">
                {highlightedText}
              </div>
            </div>

            {/* Detailed Match List */}
            {matches.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Match Details</h3>
                <div className="space-y-3">
                  {matches.map((match, idx) => (
                    <div key={idx} className="border border-gray-100 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-600">Match {idx + 1}</span>
                        <span className="text-xs text-gray-400 font-mono">Index: {match.index}</span>
                      </div>
                      <div className="p-3 bg-white space-y-2">
                        <div className="flex items-start text-sm">
                          <span className="w-16 text-gray-400 flex-shrink-0">Full</span>
                          <span className="font-mono bg-blue-50 text-blue-700 px-1 rounded">{match[0]}</span>
                        </div>
                        {match.length > 1 && Array.from(match).slice(1).map((group, groupIdx) => (
                          <div key={groupIdx} className="flex items-start text-sm">
                            <span className="w-16 text-gray-400 flex-shrink-0">Group {groupIdx + 1}</span>
                            <span className="font-mono bg-purple-50 text-purple-700 px-1 rounded">{group || <span className="text-gray-300 italic">undefined</span>}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Cheatsheet */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">Cheatsheet</h3>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <div className="p-0 max-h-[calc(100vh-200px)] overflow-y-auto">
                {CHEATSHEET.map((section, idx) => (
                  <div key={idx} className="border-b border-gray-100 last:border-0">
                    <div className="px-4 py-2 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {section.category}
                    </div>
                    <div className="divide-y divide-gray-50">
                      {section.items.map((item, itemIdx) => (
                        <div 
                          key={itemIdx} 
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer group transition-colors flex items-center justify-between"
                          onClick={() => setPattern(prev => prev + item.code)}
                          title="Click to append to regex"
                        >
                          <code className="text-sm font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{item.code}</code>
                          <span className="text-xs text-gray-500">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
