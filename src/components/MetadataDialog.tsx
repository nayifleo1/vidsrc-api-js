import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Chip,
    Rating,
    CircularProgress,
    IconButton,
    Button,
    Container,
    alpha,
    useTheme,
    Fade,
    Tabs,
    Tab
} from '@mui/material';
import { ArrowBackIcon, DownloadIcon, PlayArrowIcon } from '@mui/icons-material';

const renderStreamPanel = () => {
    if (!showStreamPanel) return null;

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: { xs: '100%', md: '40%' },
                height: '100vh',
                bgcolor: 'rgba(0, 0, 0, 0.95)',
                backdropFilter: 'blur(20px)',
                borderLeft: `1px solid ${alpha('#fff', 0.1)}`,
                zIndex: 1300,
                overflowY: 'auto',
                transform: showStreamPanel ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s ease-in-out',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box sx={{
                p: 3,
                borderBottom: `1px solid ${alpha('#fff', 0.1)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box>
                    <Typography sx={{
                        color: '#fff',
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        mb: 0.5
                    }}>
                        Season {selectedSeason} Episode {selectedEpisode}
                    </Typography>
                    {selectedEpisodeData?.title && (
                        <Typography sx={{ color: alpha('#fff', 0.7) }}>
                            {selectedEpisodeData.title}
                        </Typography>
                    )}
                </Box>
                <IconButton 
                    onClick={() => setShowStreamPanel(false)}
                    sx={{ 
                        color: '#fff',
                        '&:hover': { bgcolor: alpha('#fff', 0.1) }
                    }}
                >
                    <ArrowBackIcon />
                </IconButton>
            </Box>

            <Box sx={{ flex: 1, p: 3 }}>
                {loadingStreams ? (
                    <Box 
                        display="flex" 
                        justifyContent="center" 
                        alignItems="center" 
                        flexDirection="column"
                        gap={3}
                        sx={{ height: '100%' }}
                    >
                        <CircularProgress />
                        <Typography sx={{ color: alpha('#fff', 0.7) }}>
                            Loading available streams...
                        </Typography>
                    </Box>
                ) : Object.keys(groupedStreams).length > 0 ? (
                    <Box>
                        {Object.entries(groupedStreams).map(([addonId, { addonName, streams }]) => (
                            <Box key={addonId} sx={{ mb: 4 }}>
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    mb: 2
                                }}>
                                    <Box
                                        sx={{
                                            width: 4,
                                            height: 20,
                                            background: 'linear-gradient(180deg, #14b8a6, #0d9488)',
                                            borderRadius: 1,
                                            mr: 2
                                        }}
                                    />
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            fontWeight: 600,
                                            color: '#fff'
                                        }}
                                    >
                                        {addonName}
                                    </Typography>
                                </Box>

                                <Box>
                                    {streams.map((stream) => {
                                        const quality = getStreamQualityInfo(stream);
                                        const size = stream.title.match(/💾\s*([\d.]+\s*[GM]B)/)?.[1] || '';
                                        return (
                                            <Box
                                                key={stream.url}
                                                onClick={() => handleStreamClick(stream)}
                                                sx={{
                                                    mb: 2,
                                                    p: 2,
                                                    borderRadius: 2,
                                                    bgcolor: alpha('#fff', 0.03),
                                                    border: `1px solid ${alpha('#fff', 0.1)}`,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease-in-out',
                                                    '&:hover': {
                                                        bgcolor: alpha('#fff', 0.06),
                                                        borderColor: alpha(theme.palette.primary.main, 0.3),
                                                        transform: 'translateY(-2px)'
                                                    }
                                                }}
                                            >
                                                <Box sx={{ 
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 2
                                                }}>
                                                    <Box 
                                                        sx={{ 
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            width: 40,
                                                            height: 40,
                                                            borderRadius: 1,
                                                            bgcolor: stream.behaviorHints?.notWebReady ? 
                                                                alpha(theme.palette.warning.main, 0.1) : 
                                                                alpha(theme.palette.primary.main, 0.1),
                                                            color: stream.behaviorHints?.notWebReady ?
                                                                theme.palette.warning.main :
                                                                theme.palette.primary.main
                                                        }}
                                                    >
                                                        {stream.behaviorHints?.notWebReady ? 
                                                            <DownloadIcon /> : 
                                                            <PlayArrowIcon />}
                                                    </Box>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography 
                                                            sx={{ 
                                                                color: '#fff',
                                                                fontWeight: 600,
                                                                mb: 1
                                                            }}
                                                        >
                                                            {stream.title || stream.name || 'Unnamed Stream'}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                            {quality && (
                                                                <QualityChip 
                                                                    icon={<FourKIcon sx={{ fontSize: '1rem' }} />}
                                                                    label={quality}
                                                                />
                                                            )}
                                                            {getHDRInfo(stream) && (
                                                                <QualityChip 
                                                                    icon={<BrightnessHighIcon sx={{ fontSize: '1rem' }} />}
                                                                    label={getHDRInfo(stream)}
                                                                    color="secondary"
                                                                />
                                                            )}
                                                            {getCodecInfo(stream) && (
                                                                <QualityChip 
                                                                    icon={<MovieIcon sx={{ fontSize: '1rem' }} />}
                                                                    label={getCodecInfo(stream)}
                                                                />
                                                            )}
                                                            {getAudioInfo(stream).map((format, index) => (
                                                                <QualityChip 
                                                                    key={index}
                                                                    icon={<SurroundSoundIcon sx={{ fontSize: '1rem' }} />}
                                                                    label={format}
                                                                    color="warning"
                                                                />
                                                            ))}
                                                            {size && (
                                                                <QualityChip 
                                                                    icon={<span>💾</span>}
                                                                    label={size}
                                                                />
                                                            )}
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        );
                                    }))
                                }</Box>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Box 
                        sx={{ 
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                            p: 4,
                            textAlign: 'center'
                        }}
                    >
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                bgcolor: alpha('#fff', 0.08),
                                mb: 2
                            }}
                        >
                            <Typography
                                sx={{
                                    fontSize: '2.5rem',
                                    color: alpha('#fff', 0.5)
                                }}
                            >
                                📺
                            </Typography>
                        </Box>
                        <Typography 
                            variant="h6"
                            sx={{ 
                                color: '#fff',
                                fontWeight: 600,
                                mb: 1
                            }}
                        >
                            No Streams Found
                        </Typography>
                        <Typography 
                            sx={{ 
                                color: alpha('#fff', 0.7),
                                fontSize: '1.1rem'
                            }}
                        >
                            No streams available for this episode. Try another episode or make sure you have streaming addons installed.
                        </Typography>
                    </Box>
                )}
            </Box>
            <Box sx={{
                p: 2,
                bgcolor: alpha('#fff', 0.1),
                borderRadius: 1,
                mt: 2
            }}>
                <Typography sx={{ color: '#fff', fontWeight: 600 }}>Selected Stream URL:</Typography>
                <Typography sx={{ color: '#fff', wordBreak: 'break-all' }}>
                    {selectedEpisodeData ? selectedEpisodeData.streamUrl : 'No stream selected'}
                </Typography>
            </Box>
        </Box>
    );
}; 