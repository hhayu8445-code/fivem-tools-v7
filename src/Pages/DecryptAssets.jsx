import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Checkbox } from '@/Components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';

export default function DecryptAssets() {
  const [sessionId, setSessionId] = useState('');
  const [status, setStatus] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [file, setFile] = useState(null);
  const [cfxKey, setCfxKey] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const { base44 } = await import('@/api/base44Client');
        if (await base44.auth.isAuthenticated()) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    fetchUser();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const ext = selectedFile.name.toLowerCase();
      if (!ext.endsWith('.zip') && !ext.endsWith('.fxap')) {
        setStatus({ type: 'error', message: 'Only .zip and .fxap files are supported' });
        return;
      }
      setFile(selectedFile);
      setStatus(null);
    }
  };

  const handleUploadDecrypt = async () => {
    if (!file) {
      setStatus({ type: 'error', message: 'Please select a file' });
      return;
    }
    if (!agreed) {
      setStatus({ type: 'error', message: 'Please agree to the terms and conditions' });
      return;
    }

    setIsUploading(true);
    setStatus({ type: 'processing', message: 'Verifying vouch and uploading...' });

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (cfxKey.trim()) {
        formData.append('license', cfxKey);
      }

      const response = await fetch('/api/decrypt', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setSessionId(data.sessionId);
        setStatus({
          type: 'success',
          message: 'File uploaded successfully! Processing...',
          sessionId: data.sessionId
        });
        setTimeout(() => checkStatus(data.sessionId), 3000);
      } else {
        setStatus({ type: 'error', message: data.error || 'Upload failed' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error uploading file' });
    } finally {
      setIsUploading(false);
    }
  };

  const checkStatus = async (sid = sessionId) => {
    if (!sid) return;
    try {
      const response = await fetch(`/status/${sid}`);
      const data = await response.json();

      if (data.status === 'processing') {
        setStatus({ type: 'processing', message: 'Processing your files...' });
        setTimeout(() => checkStatus(sid), 5000);
      } else if (data.status === 'ready' || data.status === 'completed') {
        setStatus({
          type: 'success',
          message: 'Your files are ready for download!',
          downloadUrl: `/download/${sid}`
        });
      } else if (data.status === 'failed') {
        setStatus({ type: 'error', message: 'Decryption failed. Please check your file.' });
      }
    } catch (error) {
      console.error('Status check error:', error);
    }
  };

  const checkSessionStatus = async () => {
    if (!sessionId.trim()) {
      setStatus({ type: 'error', message: 'Please enter a session ID' });
      return;
    }

    setIsChecking(true);
    setStatus({ type: 'processing', message: 'Checking status...' });

    try {
      const response = await fetch(`/status/${sessionId}`);
      const data = await response.json();

      if (data.status === 'processing') {
        setStatus({ type: 'processing', message: 'Processing your files...' });
      } else if (data.status === 'ready' || data.status === 'completed') {
        setStatus({
          type: 'success',
          message: 'Your files are ready for download!',
          downloadUrl: `/download/${sessionId}`
        });
      } else if (data.status === 'downloaded') {
        setStatus({ type: 'error', message: 'File has already been downloaded and removed' });
      } else {
        setStatus({ type: 'error', message: 'Session not found or expired' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error checking status' });
    } finally {
      setIsChecking(false);
    }
  };

  const handleClear = () => {
    setSessionId('');
    setStatus(null);
  };

  if (!user) {
    return (
      <div className="py-10 max-w-4xl mx-auto">
        <div className="text-center space-y-6">
          <Badge variant="outline" className="border-fuchsia-500/50 text-fuchsia-400 bg-fuchsia-500/10 px-4 py-1 text-sm uppercase tracking-widest">
            Authentication Required
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white">
            Login <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400">Required</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            You must be logged in with Discord to use the decrypt service
          </p>
          <Card className="bg-zinc-900 border-zinc-800 max-w-md mx-auto">
            <CardContent className="pt-6 space-y-4">
              <div className="flex flex-col items-center gap-4">
                <img src="https://cdn-icons-png.flaticon.com/512/14857/14857399.png" className="w-16 h-16" alt="Discord" />
                <p className="text-zinc-300 text-center">Please login with your Discord account to access the decrypt service</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-6xl mx-auto">
      <div className="text-center mb-12 space-y-4">
        <Badge variant="outline" className="border-fuchsia-500/50 text-fuchsia-400 bg-fuchsia-500/10 px-4 py-1 text-sm uppercase tracking-widest">
          CFX V7 Tools
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold text-white">
          Decrypt Assets <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-400">CFX V7</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Decrypt your encrypted CFX assets quickly and securely
        </p>
      </div>

      <Tabs defaultValue="upload" className="max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="upload" className="data-[state=active]:bg-fuchsia-600">Upload & Decrypt</TabsTrigger>
          <TabsTrigger value="check" className="data-[state=active]:bg-fuchsia-600">Check Session</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 justify-center">
                <img src="https://img.icons8.com/3d-fluency/94/upload.png" className="w-6 h-6" alt="Upload" />
                Upload & Decrypt
              </CardTitle>
              <CardDescription className="text-center text-zinc-400">
                Upload your encrypted FiveM resource
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold">Discord Connection</h3>
                  <a href="https://discord.gg/WYR27uKFns" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm rounded-lg transition-colors">
                    <img src="https://cdn-icons-png.flaticon.com/512/14857/14857399.png" className="w-4 h-4" alt="Discord" />
                    Join Discord
                  </a>
                </div>
                <p className="text-sm text-zinc-400">You must have a vouch message in our Discord server to use this service</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">CFX License Key <span className="text-zinc-500">(Optional)</span></label>
                <Input
                  type="text"
                  placeholder="Enter your CFX license key (optional)..."
                  className="bg-zinc-950 border-zinc-800 text-zinc-300"
                  value={cfxKey}
                  onChange={(e) => setCfxKey(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Upload File (.zip or .fxap) <span className="text-red-400">*</span></label>
                <Input
                  type="file"
                  accept=".zip,.fxap"
                  onChange={handleFileChange}
                  className="bg-zinc-950 border-zinc-800 text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-fuchsia-600 file:text-white file:cursor-pointer hover:file:bg-fuchsia-700"
                />
                {file && (
                  <p className="text-sm text-zinc-400 mt-2">Selected: {file.name}</p>
                )}
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <img src="https://img.icons8.com/3d-fluency/94/info.png" className="w-5 h-5" alt="Info" />
                  Terms & Conditions
                </h3>
                <ul className="text-sm text-zinc-400 space-y-2 list-disc list-inside">
                  <li>Maximum file size: 100MB</li>
                  <li>Only .zip and .fxap formats supported</li>
                  <li>You must have a vouch message in our Discord server</li>
                  <li>Files will be automatically deleted after download</li>
                  <li>Decryption process takes 1-5 minutes</li>
                  <li>You are responsible for the files you upload</li>
                </ul>
                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="terms"
                    checked={agreed}
                    onCheckedChange={setAgreed}
                    className="border-zinc-700 data-[state=checked]:bg-fuchsia-600"
                  />
                  <label htmlFor="terms" className="text-sm text-zinc-300 cursor-pointer">
                    I agree to the terms and conditions above
                  </label>
                </div>
              </div>

              <Button
                onClick={handleUploadDecrypt}
                disabled={!file || !agreed || isUploading}
                className="w-full bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-700 hover:to-violet-700 text-white h-14 text-lg font-semibold shadow-lg shadow-fuchsia-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <img src="https://img.icons8.com/3d-fluency/94/key.png" className="w-5 h-5 mr-2" alt="Decrypt" />
                    Start Decrypt
                  </>
                )}
              </Button>

              {status && (
                <div className={`p-4 rounded-lg border flex items-start gap-3 ${status.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                  status.type === 'processing' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                    'bg-green-500/10 border-green-500/30 text-green-400'
                  }`}>
                  {status.type === 'processing' && (
                    <div className="w-4 h-4 mt-0.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  {status.type === 'success' && (
                    <svg className="w-4 h-4 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  )}
                  {status.type === 'error' && (
                    <svg className="w-4 h-4 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{status.message}</p>
                    {status.sessionId && (
                      <p className="text-xs mt-1 opacity-75">Session ID: {status.sessionId}</p>
                    )}
                  </div>
                </div>
              )}

              {status?.downloadUrl && (
                <a
                  href={status.downloadUrl}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-14 rounded-lg text-lg font-semibold shadow-lg transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7,10 12,15 17,10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Files
                </a>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="check">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 justify-center">
                <img src="https://img.icons8.com/3d-fluency/94/key.png" className="w-6 h-6" alt="Session" />
                Session Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="text"
                placeholder="Enter session ID..."
                className="bg-zinc-950 border-zinc-800 text-zinc-300 h-14 text-lg"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkSessionStatus()}
              />

              <Button
                onClick={checkSessionStatus}
                disabled={isChecking}
                className="w-full bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-700 hover:to-violet-700 text-white h-14 text-lg font-semibold shadow-lg shadow-fuchsia-900/20"
              >
                {isChecking ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check Session'
                )}
              </Button>

              {status && (
                <div className={`p-4 rounded-lg border flex items-start gap-3 ${status.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                  status.type === 'processing' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                    'bg-green-500/10 border-green-500/30 text-green-400'
                  }`}>
                  {status.type === 'processing' && (
                    <div className="w-4 h-4 mt-0.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  {status.type === 'success' && (
                    <svg className="w-4 h-4 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  )}
                  {status.type === 'error' && (
                    <svg className="w-4 h-4 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{status.message}</p>
                  </div>
                </div>
              )}

              {status?.downloadUrl && (
                <a
                  href={status.downloadUrl}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-14 rounded-lg text-lg font-semibold shadow-lg transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7,10 12,15 17,10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Files
                </a>
              )}

              {sessionId && (
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 h-12"
                >
                  Clear
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <img src="https://img.icons8.com/3d-fluency/94/lightning-bolt.png" className="w-10 h-10 mx-auto mb-4" alt="Fast" />
          <h3 className="text-white font-bold mb-2">Lightning Fast</h3>
          <p className="text-zinc-500 text-sm">Decrypt your assets in seconds</p>
        </div>
        <div className="text-center p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <img src="https://cdn3d.iconscout.com/3d/premium/thumb/antivirus-3d-icon-png-download-4159679.png" className="w-10 h-10 mx-auto mb-4" alt="Secure" />
          <h3 className="text-white font-bold mb-2">100% Secure</h3>
          <p className="text-zinc-500 text-sm">Your files are automatically deleted after download</p>
        </div>
        <div className="text-center p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <img src="https://img.icons8.com/3d-fluency/94/code.png" className="w-10 h-10 mx-auto mb-4" alt="Support" />
          <h3 className="text-white font-bold mb-2">CFX V7 Support</h3>
          <p className="text-zinc-500 text-sm">Full support for latest CFX encryption</p>
        </div>
      </div>
    </div>
  );
}
