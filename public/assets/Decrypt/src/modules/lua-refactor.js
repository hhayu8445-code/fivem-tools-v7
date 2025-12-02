const fs = require('fs');
const path = require('path');

class LuaRefactor {
    constructor() {
        this.variableMap = new Map();
        this.functionMap = new Map();
        this.counter = 1;
    }

    generateName(prefix, hint = '') {
        if (hint) {
            const clean = hint.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            if (clean.length > 2) return clean;
        }
        return `${prefix}${this.counter++}`;
    }

    refactorLuaContent(content) {
        if (!content || content.length < 10) return content;

        let refactored = content;

        // Replace obfuscated variables (L0_1, A0_2, etc.)
        refactored = refactored.replace(/\b[LA]\d+_\d+\b/g, (match) => {
            if (!this.variableMap.has(match)) {
                const name = this.generateName('var');
                this.variableMap.set(match, name);
            }
            return this.variableMap.get(match);
        });

        // Clean up function declarations
        refactored = refactored.replace(/local\s+function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g, 'function $1');

        // Improve RegisterCommand patterns
        refactored = refactored.replace(/RegisterCommand\s*\(\s*["']([^"']+)["']\s*,\s*function\s*\([^)]*\)/g, 
            'RegisterCommand("$1", function(source, args, rawCommand)');

        // Remove excessive comments but keep critical ones
        refactored = refactored.replace(/--\s*[^\r\n]*$/gm, (match) => {
            if (match.includes('TODO') || match.includes('FIXME') || match.includes('NOTE')) {
                return match;
            }
            return '';
        });

        // Clean up whitespace
        refactored = refactored.replace(/\n\s*\n\s*\n/g, '\n\n');
        refactored = refactored.replace(/^\s+$/gm, '');

        return refactored;
    }

    processLuaFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const refactored = this.refactorLuaContent(content);
            
            if (refactored !== content) {
                fs.writeFileSync(filePath, refactored, 'utf8');
                return true;
            }
            return false;
        } catch (error) {
            console.log(`Refactor error for ${filePath}:`, error.message);
            return false;
        }
    }

    processDirectory(dirPath) {
        let processedCount = 0;
        
        const processRecursive = (currentPath) => {
            const entries = fs.readdirSync(currentPath, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(currentPath, entry.name);
                
                if (entry.isDirectory()) {
                    processRecursive(fullPath);
                } else if (entry.name.toLowerCase().endsWith('.lua')) {
                    if (this.processLuaFile(fullPath)) {
                        processedCount++;
                    }
                }
            }
        };

        processRecursive(dirPath);
        return processedCount;
    }
}

module.exports = LuaRefactor;