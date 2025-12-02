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
  const [vouchLink, setVouchLink] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = React.useState(null);
  const [hasVouch, setHasVouch] = React.useState(false);
  const [isCheckingVouch, setIsCheckingVouch] = React.useState(false);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const { base44 } = await import('@/api/base44Client');
        if (await base44.auth.isAuthenticated()) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);

          // Check if user has vouch
          const vouches = await base44.entities.VouchMessage.list({
            query: { discord_user_id: currentUser.id, verified: true },
            limit: 1
          });
          setHasVouch(vouches.length > 0);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    fetchUser();
  }, []);

  const validateVouchLink = async () => {
    if (!vouchLink.trim()) {
      setStatus({ type: 'error', message: 'Please enter vouch message link' });
      return false;
    }

    // Validate Discord message link format
    const discordLinkRegex = /discord\.com\/channels\/(\d+)\/(\d+)\/(\d+)/;
    const match = vouchLink.match(discordLinkRegex);

    if (!match) {
      setStatus({ type: 'error', message: 'Invalid Discord message link format' });
      return false;
    }

    const [, guildId, channelId, messageId] = match;

    // Validate channel ID (must be from your Discord server)
    const VALID_CHANNEL_IDS = [
      '1445328264615952493', // Replace with your actual vouch channel ID
      '1404452656906375210'  // Add more channel IDs if needed
    ];

    if (!VALID_CHANNEL_IDS.includes(channelId)) {
      setStatus({
        type: 'error',
        message: 'Vouch must be from the official vouch channel. Join our Discord and post in #vouch channel.'
      });
      return false;
    }

    setIsCheckingVouch(true);
    try {
      const { base44 } = await import('@/api/base44Client');

      // Check if vouch already exists
      const existingVouch = await base44.entities.VouchMessage.list({
        query: { message_id: messageId },
        limit: 1
      });

      if (existingVouch.length > 0) {
        if (existingVouch[0].discord_user_id !== user.id) {
          setStatus({ type: 'error', message: 'This vouch belongs to another user' });
          return false;
        }
        setHasVouch(true);
        setStatus({ type: 'success', message: 'Vouch verified successfully!' });
        return true;
      }

      // Save new vouch
      await base44.entities.VouchMessage.create({
        discord_user_id: user.id,
        discord_username: user.username,
        channel_id: channelId,
        message_id: messageId,
        message_link: vouchLink,
        vouch_text: 'Vouch message from Discord',
        verified: true
      });

      setHasVouch(true);
      setStatus({ type: 'success', message: 'Vouch verified successfully!' });
      return true;
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to verify vouch. Please try again.' });
      return false;
    } finally {
      setIsCheckingVouch(false);
    }
  };

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
    if (!hasVouch) {
      setStatus({ type: 'error', message: 'Please verify your vouch message first' });
      return;
    }
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
            <CardContent className="space-y-6">
              {/* Vouch Verification Section */}
              <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border-2 border-zinc-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#5865F2]/20 flex items-center justify-center">
                      <img src="https://cdn-icons-png.flaticon.com/512/14857/14857399.png" className="w-6 h-6" alt="Discord" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">Discord Vouch Required</h3>
                      <p className="text-xs text-zinc-500">Step 1: Verify your vouch message</p>
                    </div>
                  </div>
                  {hasVouch && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20,6 9,17 4,12" />
                      </svg>
                      <span className="text-sm font-semibold text-green-400">Verified</span>
                    </div>
                  )}
                </div>

                {!hasVouch ? (
                  <>
                    <div className="bg-zinc-950/50 border border-zinc-800 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-fuchsia-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-fuchsia-400">1</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-zinc-300 font-medium">Join our Discord server</p>
                          <a href="https://discord.gg/WYR27uKFns" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm rounded-lg transition-colors font-medium">
                            <img src="https://cdn-icons-png.flaticon.com/512/14857/14857399.png" className="w-4 h-4" alt="Discord" />
                            Join Discord Server
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-fuchsia-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-fuchsia-400">2</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-zinc-300 font-medium">Post a vouch message in #vouch channel</p>
                          <p className="text-xs text-zinc-500 mt-1">Example: "Great service! Fast decrypt and secure."</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-fuchsia-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-fuchsia-400">3</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-zinc-300 font-medium">Copy the message link and paste below</p>
                          <p className="text-xs text-zinc-500 mt-1">Right-click message → Copy Message Link</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-zinc-300">
                        Vouch Message Link <span className="text-red-400">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="https://discord.com/channels/SERVER_ID/CHANNEL_ID/MESSAGE_ID"
                        className="bg-zinc-950 border-zinc-700 text-zinc-300 h-12 font-mono text-sm"
                        value={vouchLink}
                        onChange={(e) => setVouchLink(e.target.value)}
                      />
                      <p className="text-xs text-zinc-500">Paste your Discord vouch message link here</p>
                    </div>

                    <Button
                      onClick={validateVouchLink}
                      disabled={isCheckingVouch || !vouchLink.trim()}
                      className="w-full bg-gradient-to-r from-[#5865F2] to-[#4752C4] hover:from-[#4752C4] hover:to-[#3c45a5] text-white h-12 font-semibold"
                    >
                      {isCheckingVouch ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying Vouch...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20,6 9,17 4,12" />
                          </svg>
                          Verify Vouch
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22,4 12,14.01 9,11.01" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-green-400">Vouch Verified!</p>
                        <p className="text-xs text-green-400/70">You can now decrypt your assets</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* CFX License Key */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-300">CFX License Key <span className="text-zinc-500">(Optional)</span></label>
                <Input
                  type="text"
                  placeholder="Enter your CFX license key (optional)..."
                  className="bg-zinc-950 border-zinc-700 text-zinc-300 h-12"
                  value={cfxKey}
                  onChange={(e) => setCfxKey(e.target.value)}
                />
                <p className="text-xs text-zinc-500">Optional: Provide your CFX license key for better compatibility</p>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-300">Upload File (.zip or .fxap) <span className="text-red-400">*</span></label>
                <Input
                  type="file"
                  accept=".zip,.fxap"
                  onChange={handleFileChange}
                  className="bg-zinc-950 border-zinc-700 text-zinc-300 h-12 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-fuchsia-600 file:text-white file:cursor-pointer hover:file:bg-fuchsia-700 file:font-medium"
                />
                {file && (
                  <div className="flex items-center gap-2 p-3 bg-zinc-950/50 border border-zinc-800 rounded-lg">
                    <svg className="w-5 h-5 text-fuchsia-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                      <polyline points="13,2 13,9 20,9" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-300 truncate">{file.name}</p>
                      <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <img src="https://img.icons8.com/3d-fluency/94/info.png" className="w-5 h-5" alt="Info" />
                  Terms & Conditions
                </h3>
                <ul className="text-sm text-zinc-400 space-y-2.5">
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-400 mt-0.5">•</span>
                    <span>Maximum file size: 100MB</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-400 mt-0.5">•</span>
                    <span>Only .zip and .fxap formats supported</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-400 mt-0.5">•</span>
                    <span>Verified vouch message required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-400 mt-0.5">•</span>
                    <span>Files automatically deleted after download</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-400 mt-0.5">•</span>
                    <span>Decryption process takes 1-5 minutes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-fuchsia-400 mt-0.5">•</span>
                    <span>You are responsible for uploaded files</span>
                  </li>
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

              {/* Decrypt Button */}
              <Button
                onClick={handleUploadDecrypt}
                disabled={!hasVouch || !file || !agreed || isUploading}
                className="w-full bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-700 hover:to-violet-700 text-white h-14 text-lg font-bold shadow-lg shadow-fuchsia-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
