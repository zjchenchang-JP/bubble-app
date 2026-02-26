package com.zjcc.bubble.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zjcc.bubble.model.domain.Tag;
import com.zjcc.bubble.service.TagService;
import com.zjcc.bubble.mapper.TagMapper;
import org.springframework.stereotype.Service;

/**
* @author 86187
* @description 针对表【tag(标签)】的数据库操作Service实现
* @createDate 2026-02-26 21:43:45
*/
@Service
public class TagServiceImpl extends ServiceImpl<TagMapper, Tag>
    implements TagService{

}




